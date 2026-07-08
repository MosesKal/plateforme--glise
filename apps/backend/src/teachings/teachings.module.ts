import { Module } from '@nestjs/common';
import { AudioTeachingsController } from './audio/audio-teachings.controller';
import { AudioTeachingsService } from './audio/audio-teachings.service';
import { AudioTranscodeService } from './audio/audio-transcode.service';
import { MediaProbeService } from './audio/media-probe.service';
import { PodcastController } from './podcast/podcast.controller';
import { PodcastService } from './podcast/podcast.service';
import { SpeakersController } from './speakers/speakers.controller';
import { SpeakersService } from './speakers/speakers.service';
import { TagsController } from './tags/tags.controller';
import { TagsService } from './tags/tags.service';
import { ThemesController } from './themes/themes.controller';
import { ThemesService } from './themes/themes.service';
import { VideoTeachingsController } from './videos/video-teachings.controller';
import { VideoTeachingsService } from './videos/video-teachings.service';
import { YouTubeSyncService } from './videos/youtube-sync.service';

/**
 * Module Enseignements — audio (bibliothèque interne) + vidéo (miroir YouTube),
 * avec taxonomies partagées (thèmes, orateurs, tags).
 */
@Module({
  controllers: [
    ThemesController,
    SpeakersController,
    TagsController,
    AudioTeachingsController,
    VideoTeachingsController,
    PodcastController,
  ],
  providers: [
    ThemesService,
    SpeakersService,
    TagsService,
    AudioTeachingsService,
    AudioTranscodeService,
    MediaProbeService,
    VideoTeachingsService,
    YouTubeSyncService,
    PodcastService,
  ],
})
export class TeachingsModule {}
