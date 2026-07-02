import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MediaType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGalleryItemDto } from './dto/create-gallery-item.dto';
import { UpdateGalleryItemDto } from './dto/update-gallery-item.dto';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { GalleryQueryDto } from './dto/gallery-query.dto';

@Injectable()
export class GalleryService {
  constructor(private prisma: PrismaService) {}

  async findAllItems(query: GalleryQueryDto) {
    const { page = 1, limit = 20, albumId, mediaType } = query;
    const skip = (page - 1) * limit;

    const where: { albumId?: string; mediaType?: MediaType } = {};
    if (albumId) where.albumId = albumId;
    if (mediaType && (mediaType === 'IMAGE' || mediaType === 'VIDEO')) {
      where.mediaType = mediaType as MediaType;
    }

    const [items, total] = await Promise.all([
      this.prisma.galleryItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { order: 'asc' },
        include: { album: { select: { id: true, title: true } } },
      }),
      this.prisma.galleryItem.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findAllAlbums() {
    return this.prisma.album.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { items: true } },
        // 1ère image de l'album : sert de couverture de secours côté public
        // quand aucune coverUrl n'a été définie manuellement.
        items: {
          where: { mediaType: MediaType.IMAGE },
          orderBy: { order: 'asc' },
          take: 1,
          select: { mediaUrl: true },
        },
      },
    });
  }

  async findOneAlbum(id: string) {
    const album = await this.prisma.album.findUnique({
      where: { id },
      include: {
        items: { orderBy: { order: 'asc' } },
        _count: { select: { items: true } },
      },
    });
    if (!album) throw new NotFoundException('Album not found');
    return album;
  }

  async createItem(dto: CreateGalleryItemDto) {
    if (dto.albumId) {
      const album = await this.prisma.album.findUnique({
        where: { id: dto.albumId },
      });
      if (!album) throw new NotFoundException('Album not found');
    }
    return this.prisma.galleryItem.create({ data: dto });
  }

  async createItems(items: CreateGalleryItemDto[]) {
    return this.prisma.$transaction(
      items.map((item) => this.prisma.galleryItem.create({ data: item })),
    );
  }

  async updateItem(id: string, dto: UpdateGalleryItemDto) {
    const item = await this.prisma.galleryItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Gallery item not found');

    if (dto.albumId !== undefined && dto.albumId !== null) {
      const album = await this.prisma.album.findUnique({
        where: { id: dto.albumId },
      });
      if (!album) throw new NotFoundException('Album not found');
    }

    return this.prisma.galleryItem.update({ where: { id }, data: dto });
  }

  async removeItem(id: string) {
    const item = await this.prisma.galleryItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Gallery item not found');
    return this.prisma.galleryItem.delete({ where: { id } });
  }

  createAlbum(dto: CreateAlbumDto) {
    return this.prisma.album.create({ data: dto });
  }

  async updateAlbum(id: string, dto: UpdateAlbumDto) {
    const album = await this.prisma.album.findUnique({ where: { id } });
    if (!album) throw new NotFoundException('Album not found');
    return this.prisma.album.update({ where: { id }, data: dto });
  }

  async removeAlbum(id: string) {
    const album = await this.prisma.album.findUnique({
      where: { id },
      include: { _count: { select: { items: true } } },
    });
    if (!album) throw new NotFoundException('Album not found');
    if (album._count.items > 0) {
      throw new ConflictException(
        `Cannot delete album with ${album._count.items} item(s). Move or delete items first.`,
      );
    }
    return this.prisma.album.delete({ where: { id } });
  }
}
