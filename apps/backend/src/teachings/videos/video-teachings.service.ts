import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AdminVideoQueryDto,
  PublicVideoQueryDto,
} from './dto/video-query.dto';
import { UpdateVideoTeachingDto } from './dto/update-video-teaching.dto';

const VIDEO_INCLUDE = {
  theme: { select: { id: true, slug: true, nameFr: true } },
  speaker: { select: { id: true, slug: true, fullName: true, title: true } },
} satisfies Prisma.VideoTeachingInclude;

type VideoTeachingWithRelations = Prisma.VideoTeachingGetPayload<{
  include: typeof VIDEO_INCLUDE;
}>;

@Injectable()
export class VideoTeachingsService {
  constructor(private prisma: PrismaService) {}

  // ─── Lecture publique ───────────────────────────────────────────────────────

  async findAllPublic(query: PublicVideoQueryDto) {
    const { page = 1, limit = 12, themeSlug, speakerSlug, search } = query;

    const where: Prisma.VideoTeachingWhereInput = {
      status: 'PUBLISHED',
      isAvailable: true,
    };
    if (themeSlug) where.theme = { slug: themeSlug };
    if (speakerSlug) where.speaker = { slug: speakerSlug };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.videoTeaching.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: VIDEO_INCLUDE,
      }),
      this.prisma.videoTeaching.count({ where }),
    ]);

    return {
      items: items.map((v) => this.toPublic(v)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─── Backoffice ─────────────────────────────────────────────────────────────

  async findAllAdmin(query: AdminVideoQueryDto) {
    const { page = 1, limit = 50, themeId, status, search } = query;

    const where: Prisma.VideoTeachingWhereInput = {};
    if (themeId) where.themeId = themeId;
    if (status) where.status = status;
    if (search) where.title = { contains: search, mode: 'insensitive' };

    const [items, total] = await Promise.all([
      this.prisma.videoTeaching.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: VIDEO_INCLUDE,
      }),
      this.prisma.videoTeaching.count({ where }),
    ]);

    return {
      items: items.map((v) => this.toAdmin(v)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, dto: UpdateVideoTeachingDto) {
    const existing = await this.prisma.videoTeaching.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Vidéo introuvable');

    if (dto.themeId) {
      const theme = await this.prisma.teachingTheme.findUnique({
        where: { id: dto.themeId },
        select: { id: true },
      });
      if (!theme) throw new BadRequestException('Thème inexistant');
    }
    if (dto.speakerId) {
      const speaker = await this.prisma.speaker.findUnique({
        where: { id: dto.speakerId },
        select: { id: true },
      });
      if (!speaker) throw new BadRequestException('Orateur inexistant');
    }

    const updated = await this.prisma.videoTeaching.update({
      where: { id },
      data: {
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.themeId !== undefined && { themeId: dto.themeId }),
        ...(dto.speakerId !== undefined && { speakerId: dto.speakerId }),
        ...(dto.position !== undefined && { position: dto.position }),
      },
      include: VIDEO_INCLUDE,
    });
    return this.toAdmin(updated);
  }

  /**
   * Suppression locale uniquement : la vidéo reste sur YouTube et serait
   * recréée à la prochaine sync. À réserver aux vidéos indisponibles ;
   * pour masquer une vidéo active, passer son statut en ARCHIVED.
   */
  async remove(id: string) {
    const existing = await this.prisma.videoTeaching.findUnique({
      where: { id },
      select: { id: true, isAvailable: true },
    });
    if (!existing) throw new NotFoundException('Vidéo introuvable');
    if (existing.isAvailable) {
      throw new BadRequestException(
        'Cette vidéo est encore sur YouTube : la sync la recréerait. Utilisez le statut Archivé pour la masquer.',
      );
    }
    await this.prisma.videoTeaching.delete({ where: { id } });
    return { id };
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private toPublic(v: VideoTeachingWithRelations) {
    return {
      id: v.id,
      youtubeId: v.youtubeId,
      title: v.title,
      description: v.description,
      thumbnailUrl: v.thumbnailUrl,
      durationSec: v.durationSec,
      publishedAt: v.publishedAt,
      theme: v.theme,
      speaker: v.speaker,
    };
  }

  private toAdmin(v: VideoTeachingWithRelations) {
    return {
      ...this.toPublic(v),
      status: v.status,
      isAvailable: v.isAvailable,
      position: v.position,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    };
  }
}
