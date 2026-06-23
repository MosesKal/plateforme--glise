import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleEntryDto } from './dto/create-schedule-entry.dto';
import { UpdateScheduleEntryDto } from './dto/update-schedule-entry.dto';

function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  // ── Public: returns the schedule for a given week ──────────────────────────

  async getForWeek(weekParam?: string) {
    const refDate = weekParam ? new Date(weekParam) : new Date();
    const monday = getMondayOf(refDate);
    const nextMonday = new Date(monday);
    nextMonday.setUTCDate(monday.getUTCDate() + 7);

    const specificEntries = await this.prisma.scheduleEntry.findMany({
      where: {
        isRecurring: false,
        weekStart: { gte: monday, lt: nextMonday },
        isActive: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { startTime: 'asc' }],
    });

    if (specificEntries.length > 0) {
      return { source: 'weekly' as const, entries: specificEntries };
    }

    const recurringEntries = await this.prisma.scheduleEntry.findMany({
      where: { isRecurring: true, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { startTime: 'asc' }],
    });

    return { source: 'recurring' as const, entries: recurringEntries };
  }

  // ── Admin: returns all entries (for management) ────────────────────────────

  async findAll() {
    return this.prisma.scheduleEntry.findMany({
      orderBy: [{ isRecurring: 'desc' }, { weekStart: 'desc' }, { sortOrder: 'asc' }],
    });
  }

  async findOne(id: string) {
    const entry = await this.prisma.scheduleEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException('Entrée du programme introuvable');
    return entry;
  }

  async create(dto: CreateScheduleEntryDto) {
    const data: any = { ...dto };
    if (dto.weekStart) {
      data.weekStart = getMondayOf(new Date(dto.weekStart));
      data.isRecurring = false;
    }
    return this.prisma.scheduleEntry.create({ data });
  }

  async update(id: string, dto: UpdateScheduleEntryDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.weekStart) {
      data.weekStart = getMondayOf(new Date(dto.weekStart));
    }
    return this.prisma.scheduleEntry.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.scheduleEntry.delete({ where: { id } });
  }
}
