import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ScheduleService } from './schedule.service';
import { CreateScheduleEntryDto } from './dto/create-schedule-entry.dto';
import { UpdateScheduleEntryDto } from './dto/update-schedule-entry.dto';

@Controller('schedule')
export class ScheduleController {
  constructor(private scheduleService: ScheduleService) {}

  /** Public — programme de la semaine courante ou d'une semaine donnée */
  @Public()
  @Get()
  getForWeek(@Query('week') week?: string) {
    return this.scheduleService.getForWeek(week);
  }

  /** Admin — toutes les entrées pour la gestion */
  @Roles('Super Admin', 'Administrateur Général', 'Responsable Communication')
  @Get('entries')
  findAll() {
    return this.scheduleService.findAll();
  }

  @Roles('Super Admin', 'Administrateur Général', 'Responsable Communication')
  @Post()
  create(@Body() dto: CreateScheduleEntryDto) {
    return this.scheduleService.create(dto);
  }

  @Roles('Super Admin', 'Administrateur Général', 'Responsable Communication')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateScheduleEntryDto) {
    return this.scheduleService.update(id, dto);
  }

  @Roles('Super Admin', 'Administrateur Général')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scheduleService.remove(id);
  }
}
