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
import { CreateExtensionDto } from './dto/create-extension.dto';
import { UpdateExtensionDto } from './dto/update-extension.dto';
import { ExtensionsQueryDto } from './dto/extensions-query.dto';
import { ExtensionsService } from './extensions.service';

@Controller('extensions')
export class ExtensionsController {
  constructor(private extensionsService: ExtensionsService) {}

  @Public()
  @Get()
  findAll(@Query() query: ExtensionsQueryDto) {
    return this.extensionsService.findAll(query, query.country, query.status);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.extensionsService.findOne(id);
  }

  @Roles('Super Admin', 'Administrateur Général')
  @Post()
  create(@Body() dto: CreateExtensionDto) {
    return this.extensionsService.create(dto);
  }

  @Roles('Super Admin', 'Administrateur Général')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateExtensionDto) {
    return this.extensionsService.update(id, dto);
  }

  @Roles('Super Admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.extensionsService.remove(id);
  }
}
