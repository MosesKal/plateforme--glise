import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateLeaderDto } from './dto/create-leader.dto';
import { UpdateLeaderDto } from './dto/update-leader.dto';
import { LeadersService } from './leaders.service';

@Controller('leaders')
export class LeadersController {
  constructor(private leadersService: LeadersService) {}

  @Public()
  @Get()
  findAll() {
    return this.leadersService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leadersService.findOne(id);
  }

  @Roles('Super Admin', 'Administrateur Général')
  @Post()
  create(@Body() dto: CreateLeaderDto) {
    return this.leadersService.create(dto);
  }

  @Roles('Super Admin', 'Administrateur Général')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLeaderDto) {
    return this.leadersService.update(id, dto);
  }

  @Roles('Super Admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leadersService.remove(id);
  }
}
