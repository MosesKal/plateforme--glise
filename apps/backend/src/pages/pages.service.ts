import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PagesQueryDto } from './dto/pages-query.dto';

@Injectable()
export class PagesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PagesQueryDto) {
    const where: { published?: boolean } = {};
    if (query.published !== undefined) where.published = query.published;

    return this.prisma.page.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const page = await this.prisma.page.findUnique({ where: { slug } });
    if (!page) throw new NotFoundException(`Page "${slug}" introuvable`);
    return page;
  }

  async create(dto: CreatePageDto) {
    const existing = await this.prisma.page.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException(`Une page avec le slug "${dto.slug}" existe déjà`);
    return this.prisma.page.create({ data: dto });
  }

  async update(id: string, dto: UpdatePageDto) {
    await this.findOne(id);
    if (dto.slug) {
      const conflict = await this.prisma.page.findFirst({
        where: { slug: dto.slug, NOT: { id } },
      });
      if (conflict) throw new ConflictException(`Le slug "${dto.slug}" est déjà utilisé`);
    }
    return this.prisma.page.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.page.delete({ where: { id } });
  }

  private async findOne(id: string) {
    const page = await this.prisma.page.findUnique({ where: { id } });
    if (!page) throw new NotFoundException(`Page introuvable`);
    return page;
  }
}
