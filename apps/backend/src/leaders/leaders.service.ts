import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaderDto } from './dto/create-leader.dto';
import { UpdateLeaderDto } from './dto/update-leader.dto';

@Injectable()
export class LeadersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.leader.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const leader = await this.prisma.leader.findUnique({ where: { id } });
    if (!leader) throw new NotFoundException('Leader not found');
    return leader;
  }

  create(dto: CreateLeaderDto) {
    return this.prisma.leader.create({ data: dto });
  }

  async update(id: string, dto: UpdateLeaderDto) {
    await this.findOne(id);
    return this.prisma.leader.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.leader.delete({ where: { id } });
  }
}
