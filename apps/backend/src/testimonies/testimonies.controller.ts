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
import { CreateTestimonyDto } from './dto/create-testimony.dto';
import { UpdateTestimonyDto } from './dto/update-testimony.dto';
import { TestimoniesQueryDto } from './dto/testimonies-query.dto';
import { TestimoniesService } from './testimonies.service';

@Controller('testimonies')
export class TestimoniesController {
  constructor(private testimoniesService: TestimoniesService) {}

  @Roles('Super Admin', 'Administrateur Général', 'Modérateur')
  @Get()
  findAll(@Query() query: TestimoniesQueryDto) {
    return this.testimoniesService.findAll(query);
  }

  @Public()
  @Get('approved')
  findApproved() {
    return this.testimoniesService.findApproved();
  }

  @Public()
  @Post()
  create(@Body() dto: CreateTestimonyDto) {
    return this.testimoniesService.create(dto);
  }

  @Roles('Super Admin', 'Administrateur Général', 'Modérateur')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateTestimonyDto) {
    return this.testimoniesService.updateStatus(id, dto);
  }

  @Roles('Super Admin', 'Administrateur Général')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testimoniesService.remove(id);
  }
}
