import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { audioUploadOptions } from './audio-upload.options';
import { AudioTeachingsService } from './audio-teachings.service';
import {
  AdminAudioQueryDto,
  PublicAudioQueryDto,
} from './dto/audio-query.dto';
import { CreateAudioTeachingDto } from './dto/create-audio-teaching.dto';
import { ReorderAudioTeachingsDto } from './dto/reorder.dto';
import { UpdateAudioTeachingDto } from './dto/update-audio-teaching.dto';

@Controller('teachings/audio')
export class AudioTeachingsController {
  constructor(private audioTeachingsService: AudioTeachingsService) {}

  // Les routes statiques (admin, upload, reorder) sont déclarées AVANT les
  // routes paramétrées (:slug, :id) — l'ordre de déclaration fait foi dans Nest.

  @Public()
  @Get()
  findAllPublic(@Query() query: PublicAudioQueryDto) {
    return this.audioTeachingsService.findAllPublic(query);
  }

  @Roles('Super Admin', 'Administrateur Général', 'Responsable Communication')
  @Get('admin')
  findAllAdmin(@Query() query: AdminAudioQueryDto) {
    return this.audioTeachingsService.findAllAdmin(query);
  }

  @Roles('Super Admin', 'Administrateur Général', 'Responsable Communication')
  @Get('stats')
  stats() {
    return this.audioTeachingsService.stats();
  }

  @Roles('Super Admin', 'Administrateur Général', 'Responsable Communication')
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', audioUploadOptions))
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.audioTeachingsService.handleUpload(file);
  }

  @Roles('Super Admin', 'Administrateur Général', 'Responsable Communication')
  @Patch('reorder')
  reorder(@Body() dto: ReorderAudioTeachingsDto) {
    return this.audioTeachingsService.reorder(dto);
  }

  @Public()
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.audioTeachingsService.findBySlugPublic(slug);
  }

  @Public()
  @Post(':id/play')
  @HttpCode(202)
  registerPlay(@Param('id') id: string) {
    return this.audioTeachingsService.registerPlay(id);
  }

  @Roles('Super Admin', 'Administrateur Général', 'Responsable Communication')
  @Post()
  create(@Body() dto: CreateAudioTeachingDto) {
    return this.audioTeachingsService.create(dto);
  }

  @Roles('Super Admin', 'Administrateur Général', 'Responsable Communication')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAudioTeachingDto) {
    return this.audioTeachingsService.update(id, dto);
  }

  @Roles('Super Admin', 'Administrateur Général')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.audioTeachingsService.remove(id);
  }
}
