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
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  AdminVideoQueryDto,
  PublicVideoQueryDto,
} from './dto/video-query.dto';
import { UpdateVideoTeachingDto } from './dto/update-video-teaching.dto';
import { VideoTeachingsService } from './video-teachings.service';
import { YouTubeSyncService } from './youtube-sync.service';

@Controller('teachings/videos')
export class VideoTeachingsController {
  constructor(
    private videoTeachingsService: VideoTeachingsService,
    private youtubeSync: YouTubeSyncService,
  ) {}

  // Routes statiques avant les routes paramétrées (convention du module).

  @Public()
  @Get()
  findAllPublic(@Query() query: PublicVideoQueryDto) {
    return this.videoTeachingsService.findAllPublic(query);
  }

  @Roles('Super Admin', 'Administrateur Général', 'Responsable Communication')
  @Get('admin')
  findAllAdmin(@Query() query: AdminVideoQueryDto) {
    return this.videoTeachingsService.findAllAdmin(query);
  }

  @Roles('Super Admin', 'Administrateur Général', 'Responsable Communication')
  @Post('sync')
  async sync() {
    return this.youtubeSync.sync();
  }

  @Roles('Super Admin', 'Administrateur Général', 'Responsable Communication')
  @Get('sync/status')
  syncStatus() {
    return {
      configured: this.youtubeSync.isConfigured,
      lastSync: this.youtubeSync.lastSync,
    };
  }

  @Roles('Super Admin', 'Administrateur Général', 'Responsable Communication')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVideoTeachingDto) {
    return this.videoTeachingsService.update(id, dto);
  }

  @Roles('Super Admin', 'Administrateur Général')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.videoTeachingsService.remove(id);
  }
}
