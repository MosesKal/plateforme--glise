import { Injectable, NotFoundException } from '@nestjs/common';
import { TestimonyStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestimonyDto } from './dto/create-testimony.dto';
import { EditTestimonyContentDto } from './dto/edit-testimony-content.dto';
import { UpdateTestimonyDto } from './dto/update-testimony.dto';
import { TestimoniesQueryDto } from './dto/testimonies-query.dto';

@Injectable()
export class TestimoniesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: TestimoniesQueryDto) {
    const { page = 1, limit = 20, status } = query;
    const skip = (page - 1) * limit;

    const where: { status?: TestimonyStatus } = {};

    if (
      status &&
      Object.values(TestimonyStatus).includes(status as TestimonyStatus)
    ) {
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

  async findApproved(limit = 20) {
    const testimonies = await this.prisma.testimony.findMany({
      where: { status: TestimonyStatus.APPROVED },
      orderBy: { createdAt: 'desc' },
      take: limit,
      // Le numéro et les deux versions internes servent uniquement à la
      // modération et ne doivent jamais être exposés publiquement.
      select: {
        id: true,
        fullName: true,
        originalContent: true,
        editedContent: true,
        photoUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return testimonies.map(
      ({ originalContent, editedContent, ...testimony }) => ({
        ...testimony,
        content: editedContent ?? originalContent,
      }),
    );
  }

  async create(dto: CreateTestimonyDto) {
    return this.prisma.testimony.create({
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
        originalContent: dto.content,
        photoUrl: dto.photoUrl,
      },
    });
  }

  async updateStatus(id: string, dto: UpdateTestimonyDto) {
    const testimony = await this.prisma.testimony.findUnique({ where: { id } });
    if (!testimony) throw new NotFoundException('Testimony not found');
    return this.prisma.testimony.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  async updateContent(id: string, dto: EditTestimonyContentDto) {
    const testimony = await this.prisma.testimony.findUnique({ where: { id } });
    if (!testimony) throw new NotFoundException('Testimony not found');

    const editedContent = dto.editedContent?.trim() ?? null;
    const keepsCorrection =
      editedContent !== null && editedContent !== testimony.originalContent;

    return this.prisma.testimony.update({
      where: { id },
      data: {
        editedContent: keepsCorrection ? editedContent : null,
        editedAt: keepsCorrection ? new Date() : null,
      },
    });
  }

  async remove(id: string) {
    const testimony = await this.prisma.testimony.findUnique({ where: { id } });
    if (!testimony) throw new NotFoundException('Testimony not found');
    return this.prisma.testimony.delete({ where: { id } });
  }
}
