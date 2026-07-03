import { Module } from '@nestjs/common';
import { AudioTeachingsController } from './audio/audio-teachings.controller';
import { AudioTeachingsService } from './audio/audio-teachings.service';
import { MediaProbeService } from './audio/media-probe.service';
import { SpeakersController } from './speakers/speakers.controller';
import { SpeakersService } from './speakers/speakers.service';
import { TagsController } from './tags/tags.controller';
import { TagsService } from './tags/tags.service';
import { ThemesController } from './themes/themes.controller';
import { ThemesService } from './themes/themes.service';

/**
 * Module Enseignements — partie audio (bibliothèque gérée en interne).
 * La partie vidéo (sync YouTube) rejoindra ce module en phase 3 sous ./videos.
 */
@Module({
  controllers: [
    ThemesController,
    SpeakersController,
    TagsController,
    AudioTeachingsController,
  ],
  providers: [
    ThemesService,
    SpeakersService,
    TagsService,
    AudioTeachingsService,
    MediaProbeService,
  ],
})
export class TeachingsModule {}
