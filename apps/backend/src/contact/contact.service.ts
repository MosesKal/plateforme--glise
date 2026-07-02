import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateContactDto) {
    return this.prisma.contactMessage.create({ data: dto });
  }

  findAll(pagination: PaginationDto) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    return this.prisma.contactMessage.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  markRead(id: string) {
    return this.prisma.contactMessage.update({
      where: { id },
      data: { status: 'READ' },
    });
  }

  remove(id: string) {
    return this.prisma.contactMessage.delete({ where: { id } });
  }
}
