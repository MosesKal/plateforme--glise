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
import { CreateSermonDto } from './dto/create-sermon.dto';
import { UpdateSermonDto } from './dto/update-sermon.dto';
import { SermonsQueryDto } from './dto/sermons-query.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { SermonsService } from './sermons.service';

@Controller('sermons')
export class SermonsController {
  constructor(private sermonsService: SermonsService) {}

  @Public()
  @Get()
  findAll(@Query() query: SermonsQueryDto) {
    return this.sermonsService.findAll(query);
  }

  @Public()
  @Get('categories')
  findAllCategories() {
    return this.sermonsService.findAllCategories();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sermonsService.findOne(id);
  }

  @Roles('Super Admin', 'Administrateur Général', 'Responsable Communication')
  @Post()
  create(@Body() dto: CreateSermonDto) {
    return this.sermonsService.create(dto);
  }

  @Roles('Super Admin', 'Administrateur Général', 'Responsable Communication')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSermonDto) {
    return this.sermonsService.update(id, dto);
  }

  @Roles('Super Admin', 'Administrateur Général')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sermonsService.remove(id);
  }

  @Roles('Super Admin', 'Administrateur Général', 'Responsable Communication')
  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.sermonsService.createCategory(dto);
  }

  @Roles('Super Admin', 'Administrateur Général', 'Responsable Communication')
  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() dto: CreateCategoryDto) {
    return this.sermonsService.updateCategory(id, dto);
  }

  @Roles('Super Admin', 'Administrateur Général')
  @Delete('categories/:id')
  removeCategory(@Param('id') id: string) {
    return this.sermonsService.removeCategory(id);
  }
}
