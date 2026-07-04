import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { basename, extname } from 'path';
import { PrismaService } from '../../prisma/prisma.service';
import { STORAGE_PROVIDER } from '../../storage/storage-provider.interface';
import type { StorageProvider } from '../../storage/storage-provider.interface';
import { ensureUniqueSlug, slugify } from '../common/slug.util';
import { AudioTranscodeService } from './audio-transcode.service';
import { MediaProbeService } from './media-probe.service';
import {
  AdminAudioQueryDto,
  PublicAudioQueryDto,
} from './dto/audio-query.dto';
import { CreateAudioTeachingDto } from './dto/create-audio-teaching.dto';
import { ReorderAudioTeachingsDto } from './dto/reorder.dto';
import { UpdateAudioTeachingDto } from './dto/update-audio-teaching.dto';

const PUBLIC_INCLUDE = {
  theme: { select: { id: true, slug: true, nameFr: true } },
  speaker: { select: { id: true, slug: true, fullName: true, title: true } },
  tags: { include: { tag: true } },
} satisfies Prisma.AudioTeachingInclude;

type AudioTeachingWithRelations = Prisma.AudioTeachingGetPayload<{
  include: typeof PUBLIC_INCLUDE;
}>;

@Injectable()
export class AudioTeachingsService {
  constructor(
    private prisma: PrismaService,
    private mediaProbe: MediaProbeService,
    private transcode: AudioTranscodeService,
    @Inject(STORAGE_PROVIDER) private storage: StorageProvider,
  ) {}

  // ─── Upload ─────────────────────────────────────────────────────────────────

  /**
   * Réceptionne le fichier temporaire déposé par Multer : probe des
   * métadonnées, puis déplacement vers le stockage définitif sous une clé
   * datée. Le client réutilise la réponse telle quelle dans le POST de
   * création de l'enseignement.
   */
  async handleUpload(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Aucun fichier reçu');

    const probe = await this.mediaProbe.probe(file.path);
    const key = `audio/${new Date().getFullYear()}/${basename(
      file.path,
      extname(file.path),
    )}${extname(file.path)}`;

    await this.storage.save(file.path, key);

    return {
      fileKey: key,
      fileUrl: this.storage.getPublicUrl(key),
      fileSize: file.size,
      mimeType: file.mimetype,
      durationSec: probe?.durationSec ?? 0,
    };
  }

  // ─── Lecture publique ───────────────────────────────────────────────────────

  async findAllPublic(query: PublicAudioQueryDto) {
    const { page = 1, limit = 20, themeSlug, speakerSlug, tag, search, sort } = query;

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
      ];
    }

    const orderBy: Prisma.AudioTeachingOrderByWithRelationInput[] =
      sort === 'popular'
        ? [{ playCount: 'desc' }, { createdAt: 'desc' }]
        : sort === 'recent'
          ? [{ preachedAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }]
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
    if (!teaching || teaching.status !== 'PUBLISHED') {
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
    const [byStatus, aggregates, topTeachings] = await Promise.all([
      this.prisma.audioTeaching.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.audioTeaching.aggregate({
        _count: { _all: true },
        _sum: { fileSize: true, playCount: true, durationSec: true },
      }),
      this.prisma.audioTeaching.findMany({
        where: { status: 'PUBLISHED', playCount: { gt: 0 } },
        orderBy: [{ playCount: 'desc' }, { createdAt: 'desc' }],
        take: 5,
        include: PUBLIC_INCLUDE,
      }),
    ]);

    const countFor = (status: string) =>
      byStatus.find((s) => s.status === status)?._count._all ?? 0;

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
      topTeachings: topTeachings.map((t) => this.toPublic(t)),
    };
  }

  async findAllAdmin(query: AdminAudioQueryDto) {
    const { page = 1, limit = 50, themeId, status, search } = query;

    const where: Prisma.AudioTeachingWhereInput = {};
    if (themeId) where.themeId = themeId;
    if (status) where.status = status;
    if (search) where.title = { contains: search, mode: 'insensitive' };

    const [items, total] = await Promise.all([
      this.prisma.audioTeaching.findMany({
        where,
        orderBy: [{ themeId: 'asc' }, { position: 'asc' }],
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

  async create(dto: CreateAudioTeachingDto) {
    const { tags, preachedAt, fileKey, ...rest } = dto;

    await this.ensureThemeAndSpeaker(dto.themeId, dto.speakerId);

    const slug = await ensureUniqueSlug(dto.title, async (candidate) =>
      Boolean(
        await this.prisma.audioTeaching.findUnique({
          where: { slug: candidate },
          select: { id: true },
        }),
      ),
    );

    const last = await this.prisma.audioTeaching.findFirst({
      where: { themeId: dto.themeId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const created = await this.prisma.audioTeaching.create({
      data: {
        ...rest,
        slug,
        fileKey,
        preachedAt: preachedAt ? new Date(preachedAt) : undefined,
        position: (last?.position ?? -1) + 1,
        // PENDING : l'original est servi tel quel en attendant le transcodage.
        processing: 'PENDING',
        tags: this.buildTagsCreate(tags),
      },
      include: PUBLIC_INCLUDE,
    });

    if (created.fileKey) this.transcode.enqueue(created.id);

    return this.toAdmin(created);
  }

  async update(id: string, dto: UpdateAudioTeachingDto) {
    const existing = await this.prisma.audioTeaching.findUnique({
      where: { id },
      select: { id: true, fileKey: true },
    });
    if (!existing) throw new NotFoundException('Enseignement introuvable');

    if (dto.themeId || dto.speakerId) {
      await this.ensureThemeAndSpeaker(dto.themeId, dto.speakerId);
    }

    const { tags, preachedAt, fileKey, ...rest } = dto;

    // Remplacement de fichier : l'ancien est supprimé du stockage.
    if (fileKey && existing.fileKey && fileKey !== existing.fileKey) {
      await this.storage.delete(existing.fileKey);
    }

    const updated = await this.prisma.audioTeaching.update({
      where: { id },
      data: {
        ...rest,
        ...(fileKey !== undefined && { fileKey, processing: 'PENDING' as const }),
        ...(preachedAt !== undefined && {
          preachedAt: preachedAt ? new Date(preachedAt) : null,
        }),
        ...(tags !== undefined && {
          tags: { deleteMany: {}, ...this.buildTagsCreate(tags) },
        }),
      },
      include: PUBLIC_INCLUDE,
    });

    if (fileKey) this.transcode.enqueue(updated.id);

    return this.toAdmin(updated);
  }

  async remove(id: string) {
    const teaching = await this.prisma.audioTeaching.findUnique({
      where: { id },
      select: { id: true, fileKey: true, coverImage: true },
    });
    if (!teaching) throw new NotFoundException('Enseignement introuvable');

    await this.prisma.audioTeaching.delete({ where: { id } });

    // Suppression du fichier APRÈS la transaction DB : un fichier orphelin
    // est récupérable, une ligne DB pointant vers un fichier disparu ne l'est pas.
    if (teaching.fileKey) await this.storage.delete(teaching.fileKey);

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

  private buildTagsCreate(tags?: string[]) {
    if (!tags || tags.length === 0) return undefined;
    const unique = [...new Set(tags.map((t) => t.trim()).filter(Boolean))];
    return {
      create: unique.map((name) => ({
        tag: {
          connectOrCreate: {
            where: { name },
            create: { name, slug: slugify(name) },
          },
        },
      })),
    };
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
    return {
      id: t.id,
      slug: t.slug,
      title: t.title,
      description: t.description,
      preachedAt: t.preachedAt,
      durationSec: t.durationSec,
      fileSize: t.fileSize,
      fileUrl: t.fileKey ? this.storage.getPublicUrl(t.fileKey) : null,
      coverImage: t.coverImage,
      playCount: t.playCount,
      position: t.position,
      theme: t.theme,
      speaker: t.speaker,
      tags: t.tags.map(({ tag }) => tag),
    };
  }

  private toAdmin(t: AudioTeachingWithRelations) {
    return {
      ...this.toPublic(t),
      status: t.status,
      processing: t.processing,
      fileKey: t.fileKey,
      mimeType: t.mimeType,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    };
  }
}
