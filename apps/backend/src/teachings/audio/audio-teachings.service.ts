import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { STORAGE_PROVIDER } from '../../storage/storage-provider.interface';
import type { StorageProvider } from '../../storage/storage-provider.interface';
import { ensureUniqueSlug, slugify } from '../common/slug.util';
import { AudioTranscodeService } from './audio-transcode.service';
import {
  AudioUploadsService,
  ClaimedAudioUpload,
} from './audio-uploads.service';
import { AdminAudioQueryDto, PublicAudioQueryDto } from './dto/audio-query.dto';
import {
  CreateAudioTeachingDto,
  TeachingStatusDto,
} from './dto/create-audio-teaching.dto';
import { ReorderAudioTeachingsDto } from './dto/reorder.dto';
import { UpdateAudioTeachingDto } from './dto/update-audio-teaching.dto';

const PUBLIC_INCLUDE = {
  theme: { select: { id: true, slug: true, nameFr: true, nameEn: true } },
  speaker: { select: { id: true, slug: true, fullName: true, title: true } },
  tags: { include: { tag: true } },
  mediaAsset: true,
} satisfies Prisma.AudioTeachingInclude;

type AudioTeachingWithRelations = Prisma.AudioTeachingGetPayload<{
  include: typeof PUBLIC_INCLUDE;
}>;

@Injectable()
export class AudioTeachingsService {
  private readonly logger = new Logger(AudioTeachingsService.name);

  constructor(
    private prisma: PrismaService,
    private audioUploads: AudioUploadsService,
    private transcode: AudioTranscodeService,
    @Inject(STORAGE_PROVIDER) private storage: StorageProvider,
  ) {}

  // ─── Lecture publique ───────────────────────────────────────────────────────

  async findAllPublic(query: PublicAudioQueryDto) {
    const {
      page = 1,
      limit = 20,
      themeSlug,
      speakerSlug,
      tag,
      search,
      sort,
    } = query;

    const where: Prisma.AudioTeachingWhereInput = {
      status: 'PUBLISHED',
      fileKey: { not: null },
    };
    if (themeSlug) where.theme = { slug: themeSlug };
    if (speakerSlug) where.speaker = { slug: speakerSlug };
    if (tag) where.tags = { some: { tag: { slug: tag } } };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { theme: { nameFr: { contains: search, mode: 'insensitive' } } },
        { speaker: { fullName: { contains: search, mode: 'insensitive' } } },
        {
          tags: {
            some: { tag: { name: { contains: search, mode: 'insensitive' } } },
          },
        },
      ];
    }

    const orderBy: Prisma.AudioTeachingOrderByWithRelationInput[] =
      sort === 'popular'
        ? [{ playCount: 'desc' }, { createdAt: 'desc' }]
        : sort === 'recent'
          ? [
              { preachedAt: { sort: 'desc', nulls: 'last' } },
              { createdAt: 'desc' },
            ]
          : [{ position: 'asc' }, { createdAt: 'asc' }];

    const [items, total] = await Promise.all([
      this.prisma.audioTeaching.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: PUBLIC_INCLUDE,
      }),
      this.prisma.audioTeaching.count({ where }),
    ]);

    return {
      items: items.map((t) => this.toPublic(t)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBySlugPublic(slug: string) {
    const teaching = await this.prisma.audioTeaching.findUnique({
      where: { slug },
      include: PUBLIC_INCLUDE,
    });
    if (!teaching || teaching.status !== 'PUBLISHED' || !teaching.fileKey) {
      throw new NotFoundException('Enseignement introuvable');
    }

    // Similaires : même thème ou au moins un tag commun. À cette échelle, la
    // taxonomie éditoriale bat n'importe quel algorithme de recommandation.
    const tagIds = teaching.tags.map(({ tagId }) => tagId);
    const related = await this.prisma.audioTeaching.findMany({
      where: {
        status: 'PUBLISHED',
        fileKey: { not: null },
        id: { not: teaching.id },
        OR: [
          { themeId: teaching.themeId },
          ...(tagIds.length > 0
            ? [{ tags: { some: { tagId: { in: tagIds } } } }]
            : []),
        ],
      },
      orderBy: [
        { preachedAt: { sort: 'desc', nulls: 'last' } },
        { createdAt: 'desc' },
      ],
      take: 5,
      include: PUBLIC_INCLUDE,
    });

    return {
      ...this.toPublic(teaching),
      related: related.map((t) => this.toPublic(t)),
    };
  }

  /** Beacon envoyé par le player après 30 s d'écoute réelle (compteur approximatif assumé). */
  async registerPlay(id: string) {
    try {
      await this.prisma.audioTeaching.update({
        where: { id },
        data: { playCount: { increment: 1 } },
        select: { id: true },
      });
    } catch {
      // Enseignement supprimé entre-temps : le beacon n'a pas à échouer bruyamment.
    }
    return { ok: true };
  }

  // ─── Backoffice ─────────────────────────────────────────────────────────────

  /**
   * Statistiques du module pour le tableau de bord : volumétrie, écoutes,
   * top des enseignements et consommation du budget de stockage.
   */
  async stats() {
    const [byStatus, byProcessing, missingAudio, aggregates, topTeachings] =
      await Promise.all([
        this.prisma.audioTeaching.groupBy({
          by: ['status'],
          _count: { _all: true },
        }),
        this.prisma.audioTeaching.groupBy({
          by: ['processing'],
          where: { fileKey: { not: null } },
          _count: { _all: true },
        }),
        this.prisma.audioTeaching.count({ where: { fileKey: null } }),
        this.prisma.audioTeaching.aggregate({
          _count: { _all: true },
          _sum: { fileSize: true, playCount: true, durationSec: true },
        }),
        this.prisma.audioTeaching.findMany({
          where: {
            status: 'PUBLISHED',
            fileKey: { not: null },
            playCount: { gt: 0 },
          },
          orderBy: [{ playCount: 'desc' }, { createdAt: 'desc' }],
          take: 5,
          include: PUBLIC_INCLUDE,
        }),
      ]);

    const countFor = (status: string) =>
      byStatus.find((s) => s.status === status)?._count._all ?? 0;
    const processingCountFor = (processing: string) =>
      byProcessing.find((item) => item.processing === processing)?._count
        ._all ?? 0;

    const budgetGb = Number(process.env.MEDIA_BUDGET_GB) || 100;

    return {
      total: aggregates._count._all,
      published: countFor('PUBLISHED'),
      draft: countFor('DRAFT'),
      archived: countFor('ARCHIVED'),
      totalPlays: aggregates._sum.playCount ?? 0,
      totalDurationSec: aggregates._sum.durationSec ?? 0,
      storageUsedBytes: aggregates._sum.fileSize ?? 0,
      storageBudgetBytes: budgetGb * 1024 ** 3,
      mediaHealth: {
        ready: processingCountFor('READY'),
        pending: processingCountFor('PENDING'),
        processing: processingCountFor('PROCESSING'),
        failed: processingCountFor('FAILED'),
        missing: missingAudio,
      },
      topTeachings: topTeachings.map((t) => this.toPublic(t)),
    };
  }

  async findAllAdmin(query: AdminAudioQueryDto) {
    const {
      page = 1,
      limit = 25,
      themeId,
      speakerId,
      status,
      processing,
      search,
      sort = 'recent',
    } = query;

    const where: Prisma.AudioTeachingWhereInput = {};
    if (themeId) where.themeId = themeId;
    if (speakerId) where.speakerId = speakerId;
    if (status) where.status = status;
    if (processing === 'MISSING') {
      where.fileKey = null;
    } else if (processing) {
      where.processing = processing;
      if (processing === 'READY') where.fileKey = { not: null };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { theme: { nameFr: { contains: search, mode: 'insensitive' } } },
        { speaker: { fullName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const orderBy: Prisma.AudioTeachingOrderByWithRelationInput[] =
      sort === 'oldest'
        ? [{ createdAt: 'asc' }]
        : sort === 'title'
          ? [{ title: 'asc' }]
          : sort === 'popular'
            ? [{ playCount: 'desc' }, { createdAt: 'desc' }]
            : sort === 'manual'
              ? [
                  { theme: { nameFr: 'asc' } },
                  { position: 'asc' },
                  { createdAt: 'asc' },
                ]
              : [{ createdAt: 'desc' }];

    const [items, total] = await Promise.all([
      this.prisma.audioTeaching.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: PUBLIC_INCLUDE,
      }),
      this.prisma.audioTeaching.count({ where }),
    ]);

    return {
      items: items.map((t) => this.toAdmin(t)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(dto: CreateAudioTeachingDto, userId: string) {
    await this.ensureThemeAndSpeaker(dto.themeId, dto.speakerId);
    if (dto.status === TeachingStatusDto.PUBLISHED && !dto.uploadId) {
      throw new BadRequestException(
        'Un fichier audio validé est requis pour publier un enseignement',
      );
    }

    let claim: ClaimedAudioUpload | null = null;
    if (dto.uploadId) {
      const attached = await this.audioUploads.findAttachedTeaching(
        dto.uploadId,
      );
      if (attached) {
        this.assertUploadOwner(attached.mediaAsset?.createdById, userId);
        return this.toAdmin(attached);
      }
      claim = await this.audioUploads.claimForPromotion(dto.uploadId, userId);
      try {
        await this.audioUploads.promote(claim);
      } catch (error) {
        await this.audioUploads.rollbackPromotion(claim, error);
        throw error;
      }
    }

    try {
      const created = await this.createWithUniqueRetry(dto, claim);
      if (claim) this.transcode.enqueue(created.id);
      return this.toAdmin(created);
    } catch (error) {
      if (claim) await this.audioUploads.rollbackPromotion(claim, error);
      throw error;
    }
  }

  async update(id: string, dto: UpdateAudioTeachingDto, userId: string) {
    const existing = await this.prisma.audioTeaching.findUnique({
      where: { id },
      include: { mediaAsset: true },
    });
    if (!existing) throw new NotFoundException('Enseignement introuvable');

    if (dto.themeId || dto.speakerId) {
      await this.ensureThemeAndSpeaker(dto.themeId, dto.speakerId);
    }

    if (
      dto.status === TeachingStatusDto.PUBLISHED &&
      !dto.uploadId &&
      !existing.mediaAssetId &&
      !existing.fileKey
    ) {
      throw new BadRequestException(
        'Un fichier audio validé est requis pour publier un enseignement',
      );
    }

    let claim: ClaimedAudioUpload | null = null;
    const replacingMedia = Boolean(
      dto.uploadId && dto.uploadId !== existing.mediaAssetId,
    );
    if (replacingMedia && dto.uploadId) {
      const attached = await this.audioUploads.findAttachedTeaching(
        dto.uploadId,
      );
      if (attached && attached.id !== id) {
        throw new BadRequestException(
          'Cet upload est déjà rattaché à un autre enseignement',
        );
      }
      if (!attached) {
        claim = await this.audioUploads.claimForPromotion(dto.uploadId, userId);
        try {
          await this.audioUploads.promote(claim);
        } catch (error) {
          await this.audioUploads.rollbackPromotion(claim, error);
          throw error;
        }
      }
    }

    try {
      const updated = await this.updateWithUniqueRetry(id, dto, claim);
      if (claim) this.transcode.enqueue(updated.id);

      // Le nouvel état DB est confirmé avant de toucher à l'ancien média.
      if (claim && existing.mediaAssetId !== claim.asset.id) {
        await this.deleteMediaAssetIfOrphan(
          existing.mediaAssetId,
          existing.fileKey,
        );
      }

      return this.toAdmin(updated);
    } catch (error) {
      if (claim) await this.audioUploads.rollbackPromotion(claim, error);
      throw error;
    }
  }

  async remove(id: string) {
    const teaching = await this.prisma.audioTeaching.findUnique({
      where: { id },
      select: { id: true, fileKey: true, mediaAssetId: true },
    });
    if (!teaching) throw new NotFoundException('Enseignement introuvable');

    await this.prisma.audioTeaching.delete({ where: { id } });

    // Suppression du fichier APRÈS la transaction DB : un fichier orphelin
    // est récupérable, une ligne DB pointant vers un fichier disparu ne l'est pas.
    await this.deleteMediaAssetIfOrphan(
      teaching.mediaAssetId,
      teaching.fileKey,
    );

    return { id };
  }

  async reorder(dto: ReorderAudioTeachingsDto) {
    await this.prisma.$transaction(
      dto.items.map(({ id, position }) =>
        this.prisma.audioTeaching.update({
          where: { id },
          data: { position },
          select: { id: true },
        }),
      ),
    );
    return { ok: true };
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private async createWithUniqueRetry(
    dto: CreateAudioTeachingDto,
    claim: ClaimedAudioUpload | null,
  ): Promise<AudioTeachingWithRelations> {
    const { tags, preachedAt, uploadId, ...rest } = dto;
    void uploadId;
    let lastError: unknown;

    for (let attempt = 0; attempt < 5; attempt++) {
      const slug = await ensureUniqueSlug(dto.title, async (candidate) =>
        Boolean(
          await this.prisma.audioTeaching.findUnique({
            where: { slug: candidate },
            select: { id: true },
          }),
        ),
      );

      try {
        return await this.prisma.$transaction(async (tx) => {
          const last = await tx.audioTeaching.findFirst({
            where: { themeId: dto.themeId },
            orderBy: { position: 'desc' },
            select: { position: true },
          });
          const created = await tx.audioTeaching.create({
            data: {
              ...rest,
              slug,
              preachedAt: preachedAt ? new Date(preachedAt) : undefined,
              position: (last?.position ?? -1) + 1,
              ...(claim
                ? {
                    mediaAssetId: claim.asset.id,
                    fileKey: claim.finalKey,
                    fileSize: claim.asset.fileSize,
                    mimeType: claim.asset.detectedMimeType,
                    durationSec: claim.asset.durationSec,
                    processing: 'PENDING' as const,
                  }
                : { processing: 'READY' as const }),
              tags: this.buildTagsCreate(tags),
            },
            include: PUBLIC_INCLUDE,
          });
          if (claim) await this.audioUploads.completePromotion(tx, claim);
          return created;
        });
      } catch (error) {
        lastError = error;
        if (!this.isUniqueConstraintError(error) || attempt === 4) throw error;
      }
    }
    throw lastError;
  }

  private async updateWithUniqueRetry(
    id: string,
    dto: UpdateAudioTeachingDto,
    claim: ClaimedAudioUpload | null,
  ): Promise<AudioTeachingWithRelations> {
    const { tags, preachedAt, uploadId, ...rest } = dto;
    void uploadId;
    let lastError: unknown;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          const updated = await tx.audioTeaching.update({
            where: { id },
            data: {
              ...rest,
              ...(claim && {
                mediaAssetId: claim.asset.id,
                fileKey: claim.finalKey,
                fileSize: claim.asset.fileSize,
                mimeType: claim.asset.detectedMimeType,
                durationSec: claim.asset.durationSec,
                processing: 'PENDING' as const,
              }),
              ...(preachedAt !== undefined && {
                preachedAt: preachedAt ? new Date(preachedAt) : null,
              }),
              ...(tags !== undefined && {
                tags: { deleteMany: {}, ...this.buildTagsCreate(tags) },
              }),
            },
            include: PUBLIC_INCLUDE,
          });
          if (claim) await this.audioUploads.completePromotion(tx, claim);
          return updated;
        });
      } catch (error) {
        lastError = error;
        if (!this.isUniqueConstraintError(error) || attempt === 2) throw error;
      }
    }
    throw lastError;
  }

  private buildTagsCreate(tags?: string[]) {
    if (!tags || tags.length === 0) return undefined;
    const unique = new Map<string, string>();
    for (const rawName of tags) {
      const name = rawName.trim();
      if (!name) continue;
      const slug = slugify(name);
      if (!slug) {
        throw new BadRequestException(`Tag invalide : "${name}"`);
      }
      if (!unique.has(slug)) unique.set(slug, name);
    }
    return {
      create: [...unique].map(([slug, name]) => ({
        tag: {
          connectOrCreate: {
            where: { slug },
            create: { name, slug },
          },
        },
      })),
    };
  }

  private assertUploadOwner(
    createdById: string | null | undefined,
    userId: string,
  ): void {
    if (createdById && createdById !== userId) {
      throw new BadRequestException(
        'Cet upload appartient à un autre utilisateur',
      );
    }
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }

  private async deleteMediaAssetIfOrphan(
    mediaAssetId: string | null,
    fallbackKey: string | null,
  ): Promise<void> {
    try {
      if (!mediaAssetId) {
        if (!fallbackKey) return;
        const references = await this.prisma.audioTeaching.count({
          where: { fileKey: fallbackKey },
        });
        if (references === 0) await this.storage.delete(fallbackKey);
        return;
      }

      const asset = await this.prisma.audioMediaAsset.findUnique({
        where: { id: mediaAssetId },
        include: { teaching: { select: { id: true } } },
      });
      if (!asset || asset.teaching || asset.status === 'PROCESSING') return;

      for (const key of new Set(
        [
          asset.stagingKey,
          asset.storageKey,
          asset.obsoleteStorageKey,
          fallbackKey,
        ].filter((value): value is string => Boolean(value)),
      )) {
        const [sharedAssets, sharedTeachings] = await Promise.all([
          this.prisma.audioMediaAsset.count({
            where: {
              id: { not: asset.id },
              OR: [
                { storageKey: key },
                { stagingKey: key },
                { obsoleteStorageKey: key },
              ],
            },
          }),
          this.prisma.audioTeaching.count({ where: { fileKey: key } }),
        ]);
        if (sharedAssets === 0 && sharedTeachings === 0) {
          await this.storage.delete(key);
        }
      }
      await this.prisma.audioMediaAsset.delete({ where: { id: asset.id } });
    } catch (error) {
      // La DB est déjà cohérente. Le nettoyeur périodique reprendra cet orphelin.
      this.logger.warn(
        `Nettoyage différé du média ${mediaAssetId ?? fallbackKey}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private async ensureThemeAndSpeaker(themeId?: string, speakerId?: string) {
    if (themeId) {
      const theme = await this.prisma.teachingTheme.findUnique({
        where: { id: themeId },
        select: { id: true },
      });
      if (!theme) throw new BadRequestException('Thème inexistant');
    }
    if (speakerId) {
      const speaker = await this.prisma.speaker.findUnique({
        where: { id: speakerId },
        select: { id: true },
      });
      if (!speaker) throw new BadRequestException('Orateur inexistant');
    }
  }

  private toPublic(t: AudioTeachingWithRelations) {
    const fileKey = t.mediaAsset?.storageKey ?? t.fileKey;
    return {
      id: t.id,
      slug: t.slug,
      title: t.title,
      description: t.description,
      preachedAt: t.preachedAt,
      durationSec: t.mediaAsset?.durationSec ?? t.durationSec,
      fileSize: t.mediaAsset?.fileSize ?? t.fileSize,
      fileUrl: fileKey ? this.storage.getPublicUrl(fileKey) : null,
      coverImage: t.coverImage,
      playCount: t.playCount,
      position: t.position,
      // Date d'ajout à la plateforme (≠ preachedAt) : sert au badge « Nouveau »
      // côté public — un sermon ancien fraîchement mis en ligne EST nouveau.
      createdAt: t.createdAt,
      theme: t.theme,
      speaker: t.speaker,
      tags: t.tags.map(({ tag }) => tag),
    };
  }

  private toAdmin(t: AudioTeachingWithRelations) {
    const fileKey = t.mediaAsset?.storageKey ?? t.fileKey;
    return {
      ...this.toPublic(t),
      status: t.status,
      processing: this.toLegacyProcessingStatus(t),
      fileKey,
      mimeType: t.mediaAsset?.detectedMimeType ?? t.mimeType,
      updatedAt: t.updatedAt,
    };
  }

  private toLegacyProcessingStatus(
    t: AudioTeachingWithRelations,
  ): 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED' {
    switch (t.mediaAsset?.status) {
      case 'PROCESSING':
        return 'PROCESSING';
      case 'READY':
        return 'READY';
      case 'FAILED':
        return 'FAILED';
      case 'STAGED':
      case 'PROMOTING':
      case 'PENDING':
        return 'PENDING';
      default:
        return t.processing;
    }
  }
}
