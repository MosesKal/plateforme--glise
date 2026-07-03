import { Module } from '@nestjs/common';
import { AudioTeachingsController } from './audio/audio-teachings.controller';
import { AudioTeachingsService } from './audio/audio-teachings.service';
import { MediaProbeService } from './audio/media-probe.service';
import { SpeakersController } from './speakers/speakers.controller';
import { SpeakersService } from './speakers/speakers.service';
import { ThemesController } from './themes/themes.controller';
import { ThemesService } from './themes/themes.service';

/**
 * Module Enseignements — partie audio (bibliothèque gérée en interne).
 * La partie vidéo (sync YouTube) rejoindra ce module en phase 3 sous ./videos.
 */
@Module({
  controllers: [ThemesController, SpeakersController, AudioTeachingsController],
  providers: [ThemesService, SpeakersService, AudioTeachingsService, MediaProbeService],
})
export class TeachingsModule {}
