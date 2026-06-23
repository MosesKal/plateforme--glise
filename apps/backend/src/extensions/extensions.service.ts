import { Injectable, NotFoundException } from '@nestjs/common';
import { ExtensionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateExtensionDto } from './dto/create-extension.dto';
import { UpdateExtensionDto } from './dto/update-extension.dto';

@Injectable()
export class ExtensionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(pagination: PaginationDto, country?: string) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const where = {
      status: ExtensionStatus.ACTIVE,
      ...(country ? { country } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.extension.findMany({
        where,
        skip,
        take: limit,
        orderBy: { country: 'asc' },
      }),
      this.prisma.extension.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const extension = await this.prisma.extension.findUnique({ where: { id } });
    if (!extension) throw new NotFoundException('Extension not found');
    return extension;
  }

  async create(dto: CreateExtensionDto) {
    return this.prisma.extension.create({ data: dto });
  }

  async update(id: string, dto: UpdateExtensionDto) {
    await this.findOne(id);
    return this.prisma.extension.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.extension.delete({ where: { id } });
  }
}
