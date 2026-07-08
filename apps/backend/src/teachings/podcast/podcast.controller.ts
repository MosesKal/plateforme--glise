import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { PodcastService } from './podcast.service';

@Controller('teachings')
export class PodcastController {
  constructor(private podcastService: PodcastService) {}

  /**
   * Flux RSS podcast de la bibliothèque audio.
   *
   * Réponse envoyée via @Res : le TransformInterceptor global ({ success,
   * data }) ne doit pas envelopper le XML, et le Content-Type doit être
   * application/rss+xml pour les annuaires de podcasts.
   */
  @Public()
  @Get('podcast.xml')
  async feed(@Res() res: Response) {
    const xml = await this.podcastService.buildFeed();
    res
      .type('application/rss+xml; charset=utf-8')
      // Les annuaires re-pollent le flux lentement (heures) : 15 min de cache
      // suffisent à absorber les pics sans retarder la parution d'un épisode.
      .setHeader('Cache-Control', 'public, max-age=900')
      .send(xml);
  }
}
