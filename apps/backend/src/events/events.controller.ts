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
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { RegisterEventDto } from './dto/register-event.dto';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Public()
  @Get()
  findAll(
    @Query() pagination: PaginationDto,
    @Query('upcoming') upcoming?: string,
    @Query('status') status?: string,
  ) {
    return this.eventsService.findAll(pagination, upcoming === 'true', status);
  }

  @Public()
  @Get('featured')
  findFeatured() {
    return this.eventsService.findFeatured();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Public()
  @Post(':id/register')
  register(@Param('id') id: string, @Body() dto: RegisterEventDto) {
    return this.eventsService.register(id, dto);
  }

  @Roles('Super Admin', 'Administrateur Général', 'Responsable Communication')
  @Post()
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  @Roles('Super Admin', 'Administrateur Général', 'Responsable Communication')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, dto);
  }

  @Roles('Super Admin', 'Administrateur Général')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}
