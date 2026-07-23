import { Injectable, NotFoundException } from '@nestjs/common';
import { TestimonyStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestimonyDto } from './dto/create-testimony.dto';
import { UpdateTestimonyDto } from './dto/update-testimony.dto';
import { TestimoniesQueryDto } from './dto/testimonies-query.dto';

@Injectable()
export class TestimoniesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: TestimoniesQueryDto) {
    const { page = 1, limit = 20, status } = query;
    const skip = (page - 1) * limit;

    const where: { status?: TestimonyStatus } = {};

    if (status && Object.values(TestimonyStatus).includes(status as TestimonyStatus)) {
      where.status = status as TestimonyStatus;
    } else if (!status || status === 'all') {
      // no filter for admin
    } else {
      where.status = TestimonyStatus.APPROVED;
    }

    const [items, total] = await Promise.all([
      this.prisma.testimony.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.testimony.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findApproved(limit = 20) {
    return this.prisma.testimony.findMany({
      where: { status: TestimonyStatus.APPROVED },
      orderBy: { createdAt: 'desc' },
      take: limit,
      // Le numéro sert uniquement à la modération et ne doit jamais être
      // exposé dans la liste publique des témoignages approuvés.
      select: {
        id: true,
        fullName: true,
        content: true,
        photoUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create(dto: CreateTestimonyDto) {
    return this.prisma.testimony.create({ data: dto });
  }

  async updateStatus(id: string, dto: UpdateTestimonyDto) {
    const testimony = await this.prisma.testimony.findUnique({ where: { id } });
    if (!testimony) throw new NotFoundException('Testimony not found');
    return this.prisma.testimony.update({ where: { id }, data: { status: dto.status } });
  }

  async remove(id: string) {
    const testimony = await this.prisma.testimony.findUnique({ where: { id } });
    if (!testimony) throw new NotFoundException('Testimony not found');
    return this.prisma.testimony.delete({ where: { id } });
  }
}
