import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSermonDto } from './dto/create-sermon.dto';
import { UpdateSermonDto } from './dto/update-sermon.dto';
import { SermonsQueryDto } from './dto/sermons-query.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class SermonsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: SermonsQueryDto) {
    const { page = 1, limit = 20, categoryId, search, status } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status === 'published') where.isPublished = true;
    else if (status === 'draft') where.isPublished = false;
    // status === 'all' or undefined → no filter

    if (categoryId) where.categoryId = categoryId;

    if (search) {
      where.OR = [
        { title:   { contains: search, mode: 'insensitive' } },
        { speaker: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.sermon.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { category: { select: { id: true, name: true } } },
      }),
      this.prisma.sermon.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const sermon = await this.prisma.sermon.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!sermon) throw new NotFoundException('Sermon not found');
    return sermon;
  }

  async create(dto: CreateSermonDto) {
    const { publishedAt, ...rest } = dto;
    return this.prisma.sermon.create({
      data: {
        ...rest,
        publishedAt: publishedAt ? new Date(publishedAt) : undefined,
      },
      include: { category: { select: { id: true, name: true } } },
    });
  }

  async update(id: string, dto: UpdateSermonDto) {
    await this.findOne(id);
    const { publishedAt, ...rest } = dto;
    return this.prisma.sermon.update({
      where: { id },
      data: {
        ...rest,
        publishedAt: publishedAt === null
          ? null
          : publishedAt
          ? new Date(publishedAt)
          : undefined,
      },
      include: { category: { select: { id: true, name: true } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.sermon.delete({ where: { id } });
  }

  findAllCategories() {
    return this.prisma.sermonCategory.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { sermons: true } } },
    });
  }

  async createCategory(dto: CreateCategoryDto) {
    const existing = await this.prisma.sermonCategory.findUnique({
      where: { name: dto.name },
    });
    if (existing) throw new ConflictException('Category name already exists');
    return this.prisma.sermonCategory.create({ data: dto });
  }

  async updateCategory(id: string, dto: CreateCategoryDto) {
    const existing = await this.prisma.sermonCategory.findUnique({
      where: { name: dto.name },
    });
    if (existing && existing.id !== id) {
      throw new ConflictException('Category name already exists');
    }
    return this.prisma.sermonCategory.update({ where: { id }, data: dto });
  }

  async removeCategory(id: string) {
    const cat = await this.prisma.sermonCategory.findUnique({
      where: { id },
      include: { _count: { select: { sermons: true } } },
    });
    if (!cat) throw new NotFoundException('Category not found');
    if (cat._count.sermons > 0) {
      throw new ConflictException(
        `Cannot delete category with ${cat._count.sermons} sermon(s).`,
      );
    }
    return this.prisma.sermonCategory.delete({ where: { id } });
  }
}
