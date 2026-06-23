import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateGalleryItemDto } from './dto/create-gallery-item.dto';
import { CreateAlbumDto } from './dto/create-album.dto';

@Injectable()
export class GalleryService {
  constructor(private prisma: PrismaService) {}

  async findAllItems(pagination: PaginationDto, albumId?: string) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    const where = albumId ? { albumId } : {};

    const [items, total] = await Promise.all([
      this.prisma.galleryItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { order: 'asc' },
        include: { album: { select: { title: true } } },
      }),
      this.prisma.galleryItem.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findAllAlbums() {
    return this.prisma.album.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { items: true } } },
    });
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

  createAlbum(dto: CreateAlbumDto) {
    return this.prisma.album.create({ data: dto });
  }

  async removeItem(id: string) {
    const item = await this.prisma.galleryItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Gallery item not found');
    return this.prisma.galleryItem.delete({ where: { id } });
  }
}
