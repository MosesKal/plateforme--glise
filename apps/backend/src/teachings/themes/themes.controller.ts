import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { ThemesService } from './themes.service';

@Controller('teachings/themes')
export class ThemesController {
  constructor(private themesService: ThemesService) {}

  @Public()
  @Get()
  findAllPublic() {
    return this.themesService.findAllPublic();
  }

  @Roles('Super Admin', 'Administrateur Général', 'Responsable Communication')
  @Get('all')
  findAllAdmin() {
    return this.themesService.findAllAdmin();
  }

  @Public()
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.themesService.findBySlug(slug);
  }

  @Roles('Super Admin', 'Administrateur Général', 'Responsable Communication')
  @Post()
  create(@Body() dto: CreateThemeDto) {
    return this.themesService.create(dto);
  }

  @Roles('Super Admin', 'Administrateur Général', 'Responsable Communication')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateThemeDto) {
    return this.themesService.update(id, dto);
  }

  @Roles('Super Admin', 'Administrateur Général')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.themesService.remove(id);
  }
}
