import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { RegisterEventDto } from './dto/register-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll(pagination: PaginationDto, upcoming?: boolean) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const where = {
      status: EventStatus.PUBLISHED,
      ...(upcoming ? { startDate: { gte: new Date() } } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: 'asc' },
      }),
      this.prisma.event.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findFeatured() {
    return this.prisma.event.findMany({
      where: { status: EventStatus.PUBLISHED, isFeatured: true },
      orderBy: { startDate: 'asc' },
      take: 3,
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async create(dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        ...dto,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async update(id: string, dto: UpdateEventDto) {
    await this.findOne(id);
    return this.prisma.event.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.event.delete({ where: { id } });
  }

  async register(eventId: string, dto: RegisterEventDto) {
    await this.findOne(eventId);

    const existing = await this.prisma.eventRegistration.findUnique({
      where: { eventId_email: { eventId, email: dto.email } },
    });
    if (existing) throw new ConflictException('Already registered for this event');

    return this.prisma.eventRegistration.create({
      data: { ...dto, eventId },
    });
  }
}
