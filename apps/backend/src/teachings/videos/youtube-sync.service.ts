import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

// Surchargeable pour les tests d'intégration (mock local de l'API).
const YOUTUBE_API =
  process.env.YOUTUBE_API_URL?.trim() || 'https://www.googleapis.com/youtube/v3';

export interface SyncResult {
  created: number;
  updated: number;
  unavailable: number;
  total: number;
  syncedAt: string;
}

interface YouTubeVideoData {
  youtubeId: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  durationSec: number;
  publishedAt: Date;
}

export interface PublicYouTubeLive {
  youtubeId: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  channelTitle: string | null;
  startedAt: string | null;
  concurrentViewers: number | null;
}

const LIVE_CACHE_WHEN_OFFLINE_MS = 15 * 60 * 1000;
const LIVE_CACHE_WHEN_ACTIVE_MS = 2 * 60 * 1000;

/**
 * Synchronisation de la chaîne YouTube vers la table video_teachings.
 *
 * Source : la playlist « uploads » de la chaîne (YOUTUBE_CHANNEL_ID), lue via
 * la YouTube Data API v3 (YOUTUBE_API_KEY). Coût quota : ~1 unité par page de
 * 50 vidéos — négligeable à raison d'une sync toutes les 6 h.
 *
 * Règle d'or : la sync ne réécrit QUE les champs miroir de YouTube (titre,
 * description, vignette, durée, date, disponibilité). Les champs éditoriaux
 * (status, thème, orateur, position) appartiennent au backoffice et ne sont
 * jamais touchés — une vidéo masquée par l'admin reste masquée après sync.
 *
 * Les vidéos disparues de la chaîne (supprimées/privées) passent en
 * isAvailable=false : elles sortent du site sans perdre l'enrichissement
 * éditorial, et reviennent seules si elles réapparaissent sur YouTube.
 */
@Injectable()
export class YouTubeSyncService {
  private readonly logger = new Logger(YouTubeSyncService.name);
  private syncing = false;
  private lastResult: SyncResult | null = null;
  private liveCache: { value: PublicYouTubeLive | null; expiresAt: number } | null = null;
  private liveRequest: Promise<PublicYouTubeLive | null> | null = null;

  constructor(private prisma: PrismaService) {}

  get lastSync(): SyncResult | null {
    return this.lastResult;
  }

  get isConfigured(): boolean {
    return Boolean(
      process.env.YOUTUBE_API_KEY?.trim() &&
        process.env.YOUTUBE_CHANNEL_ID?.trim(),
    );
  }

  /**
   * Direct public actif de la chaîne. Le résultat négatif est conservé 15 min
   * pour respecter le quota YouTube ; pendant un direct, la fraîcheur passe à
   * 2 min afin de détecter rapidement sa fin.
   */
  async findCurrentLive(): Promise<PublicYouTubeLive | null> {
    if (!this.isConfigured) return null;
    if (this.liveCache && this.liveCache.expiresAt > Date.now()) {
      return this.liveCache.value;
    }
    if (this.liveRequest) return this.liveRequest;

    this.liveRequest = this.fetchCurrentLive()
      .then((value) => {
        this.liveCache = {
          value,
          expiresAt:
            Date.now() + (value ? LIVE_CACHE_WHEN_ACTIVE_MS : LIVE_CACHE_WHEN_OFFLINE_MS),
        };
        return value;
      })
      .finally(() => {
        this.liveRequest = null;
      });

    return this.liveRequest;
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async scheduledSync(): Promise<void> {
    if (!this.isConfigured) return; // env absente : cron silencieux (dev)
    try {
      await this.sync();
    } catch (err) {
      this.logger.error(`Sync YouTube planifiée échouée : ${err}`);
    }
  }

  /** Sync complète — appelée par le cron et par POST /teachings/videos/sync. */
  async sync(): Promise<SyncResult> {
    if (!this.isConfigured) {
      throw new BadRequestException(
        'Sync YouTube non configurée : définir YOUTUBE_API_KEY et YOUTUBE_CHANNEL_ID',
      );
    }
    if (this.syncing) {
      throw new BadRequestException('Une synchronisation est déjà en cours');
    }

    this.syncing = true;
    try {
      const videos = await this.fetchChannelVideos();

      let created = 0;
      let updated = 0;
      for (const video of videos) {
        const syncedFields = {
          title: video.title,
          description: video.description,
          thumbnailUrl: video.thumbnailUrl,
          durationSec: video.durationSec,
          publishedAt: video.publishedAt,
          isAvailable: true,
        };
        const existing = await this.prisma.videoTeaching.findUnique({
          where: { youtubeId: video.youtubeId },
          select: { id: true },
        });
        if (existing) {
          await this.prisma.videoTeaching.update({
            where: { id: existing.id },
            data: syncedFields,
          });
          updated++;
        } else {
          await this.prisma.videoTeaching.create({
            data: { youtubeId: video.youtubeId, ...syncedFields },
          });
          created++;
        }
      }

      // La liste récupérée est exhaustive : tout youtubeId absent a disparu
      // de la chaîne. isAvailable est un champ synchronisé, pas éditorial.
      const { count: unavailable } = await this.prisma.videoTeaching.updateMany(
        {
          where: {
            youtubeId: { notIn: videos.map((v) => v.youtubeId) },
            isAvailable: true,
          },
          data: { isAvailable: false },
        },
      );

      const result: SyncResult = {
        created,
        updated,
        unavailable,
        total: videos.length,
        syncedAt: new Date().toISOString(),
      };
      this.lastResult = result;
      this.logger.log(
        `Sync YouTube : ${created} créée(s), ${updated} mise(s) à jour, ${unavailable} indisponible(s)`,
      );
      return result;
    } finally {
      this.syncing = false;
    }
  }

  // ─── YouTube Data API ───────────────────────────────────────────────────────

  private async fetchCurrentLive(): Promise<PublicYouTubeLive | null> {
    const apiKey = process.env.YOUTUBE_API_KEY!.trim();
    const channelId = process.env.YOUTUBE_CHANNEL_ID!.trim();
    const search = await this.get('/search', {
      key: apiKey,
      channelId,
      part: 'snippet',
      eventType: 'live',
      type: 'video',
      maxResults: '1',
    });
    const youtubeId: string | undefined = search.items?.[0]?.id?.videoId;
    if (!youtubeId) return null;

    const details = await this.get('/videos', {
      key: apiKey,
      id: youtubeId,
      part: 'snippet,liveStreamingDetails,status',
    });
    const video = details.items?.[0];
    if (!video || video.status?.embeddable === false) return null;

    const snippet = video.snippet ?? {};
    const live = video.liveStreamingDetails ?? {};
    const thumbs = snippet.thumbnails ?? {};
    const viewers = Number(live.concurrentViewers);
    return {
      youtubeId,
      title: snippet.title ?? 'YouTube Live',
      description: snippet.description || null,
      thumbnailUrl:
        thumbs.maxres?.url ?? thumbs.high?.url ?? thumbs.medium?.url ?? null,
      channelTitle: snippet.channelTitle || null,
      startedAt: live.actualStartTime ?? null,
      concurrentViewers: Number.isFinite(viewers) ? viewers : null,
    };
  }

  private async fetchChannelVideos(): Promise<YouTubeVideoData[]> {
    const apiKey = process.env.YOUTUBE_API_KEY!.trim();
    const channelId = process.env.YOUTUBE_CHANNEL_ID!.trim();

    // 1. Playlist « uploads » de la chaîne
    const channel = await this.get('/channels', {
      key: apiKey,
      id: channelId,
      part: 'contentDetails',
    });
    const uploadsId: string | undefined =
      channel.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsId) {
      throw new Error(`Chaîne YouTube introuvable : ${channelId}`);
    }

    // 2. Tous les IDs de la playlist (paginé par 50)
    const ids: string[] = [];
    let pageToken: string | undefined;
    do {
      const page = await this.get('/playlistItems', {
        key: apiKey,
        playlistId: uploadsId,
        part: 'contentDetails',
        maxResults: '50',
        ...(pageToken && { pageToken }),
      });
      for (const item of page.items ?? []) {
        const id = item.contentDetails?.videoId;
        if (id) ids.push(id);
      }
      pageToken = page.nextPageToken;
    } while (pageToken);

    // 3. Détails des vidéos (durée, vignettes) par lots de 50.
    //    videos.list ne renvoie que les vidéos publiques et lisibles : les
    //    privées/supprimées sont filtrées d'office.
    const videos: YouTubeVideoData[] = [];
    for (let i = 0; i < ids.length; i += 50) {
      const batch = await this.get('/videos', {
        key: apiKey,
        id: ids.slice(i, i + 50).join(','),
        part: 'snippet,contentDetails',
      });
      for (const item of batch.items ?? []) {
        // Les lives programmés/en cours n'ont pas de durée exploitable.
        if (item.snippet?.liveBroadcastContent !== 'none') continue;
        const thumbs = item.snippet?.thumbnails ?? {};
        videos.push({
          youtubeId: item.id,
          title: item.snippet?.title ?? 'Sans titre',
          description: item.snippet?.description || null,
          thumbnailUrl:
            thumbs.maxres?.url ?? thumbs.high?.url ?? thumbs.medium?.url ?? null,
          durationSec: parseIsoDuration(item.contentDetails?.duration),
          publishedAt: new Date(item.snippet?.publishedAt ?? Date.now()),
        });
      }
    }
    return videos;
  }

  private async get(
    path: string,
    params: Record<string, string>,
  ): Promise<any> {
    const url = `${YOUTUBE_API}${path}?${new URLSearchParams(params)}`;
    const res = await fetch(url);
    if (!res.ok) {
      const body = await res.text();
      throw new Error(
        `YouTube API ${path} -> ${res.status} : ${body.slice(0, 300)}`,
      );
    }
    return res.json();
  }
}

/** "PT1H2M3S" → 3723 secondes (durées ISO 8601 de l'API YouTube). */
export function parseIsoDuration(iso?: string): number {
  if (!iso) return 0;
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
  if (!match) return 0;
  const [, h, m, s] = match;
  return Number(h ?? 0) * 3600 + Number(m ?? 0) * 60 + Number(s ?? 0);
}
