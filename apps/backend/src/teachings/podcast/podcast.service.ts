import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { STORAGE_PROVIDER } from '../../storage/storage-provider.interface';
import type { StorageProvider } from '../../storage/storage-provider.interface';
import { getSiteBaseUrl } from '../../common/config/app-url';

/** Échappe un texte pour un nœud ou un attribut XML. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Bloc CDATA sûr (une séquence `]]>` dans le texte fermerait le bloc). */
function cdata(value: string): string {
  return `<![CDATA[${value.replace(/]]>/g, ']]&gt;')}]]>`;
}

/**
 * Flux RSS podcast (RSS 2.0 + namespace iTunes) de la bibliothèque audio.
 *
 * Un flux conforme rend la bibliothèque distribuable telle quelle sur
 * Spotify, Apple Podcasts et YouTube Music — acquisition passive, aucune
 * application à développer. Généré à la volée : le catalogue reste petit et
 * le contrôleur pose un Cache-Control ; matérialiser le XML ne se justifiera
 * qu'à plusieurs milliers d'épisodes.
 *
 * Personnalisation par variables d'environnement (toutes optionnelles) :
 * PODCAST_TITLE, PODCAST_DESCRIPTION, PODCAST_AUTHOR, PODCAST_IMAGE_URL,
 * PODCAST_OWNER_EMAIL (requis par Apple Podcasts au moment de la soumission —
 * le bloc <itunes:owner> est omis tant qu'elle n'est pas définie).
 */
@Injectable()
export class PodcastService {
  constructor(
    private prisma: PrismaService,
    @Inject(STORAGE_PROVIDER) private storage: StorageProvider,
  ) {}

  async buildFeed(): Promise<string> {
    const teachings = await this.prisma.audioTeaching.findMany({
      where: { status: 'PUBLISHED', fileKey: { not: null } },
      orderBy: [
        { preachedAt: { sort: 'desc', nulls: 'last' } },
        { createdAt: 'desc' },
      ],
      include: {
        theme: { select: { slug: true, nameFr: true } },
        speaker: { select: { fullName: true } },
      },
    });

    const site = getSiteBaseUrl();
    const feedUrl = `${site}/podcast.xml`;
    const title = process.env.PODCAST_TITLE ?? 'Enseignements — C.E.C.J.C.';
    const description =
      process.env.PODCAST_DESCRIPTION ??
      'Les enseignements audio de la Communauté des Églises Camps de Jésus-Christ.';
    const author = process.env.PODCAST_AUTHOR ?? 'C.E.C.J.C.';
    // Apple exige une image carrée 1400–3000 px : définir PODCAST_IMAGE_URL
    // avec une vraie cover avant de soumettre le flux aux annuaires.
    const image = process.env.PODCAST_IMAGE_URL ?? `${site}/pwa-icon/512`;
    const ownerEmail = process.env.PODCAST_OWNER_EMAIL?.trim();

    const items = teachings
      .map((t) => {
        const link = `${site}/fr/enseignements/audio/${t.theme.slug}/${t.slug}`;
        const pubDate = (t.preachedAt ?? t.createdAt).toUTCString();
        const enclosureUrl = this.storage.getPublicUrl(t.fileKey as string);

        return [
          '    <item>',
          `      <title>${escapeXml(t.title)}</title>`,
          `      <link>${escapeXml(link)}</link>`,
          `      <guid isPermaLink="false">${escapeXml(t.id)}</guid>`,
          `      <pubDate>${pubDate}</pubDate>`,
          `      <description>${cdata(t.description ?? `${t.title} — ${t.theme.nameFr}`)}</description>`,
          `      <enclosure url="${escapeXml(enclosureUrl)}" length="${t.fileSize}" type="${escapeXml(t.mimeType)}" />`,
          `      <itunes:author>${escapeXml(t.speaker.fullName)}</itunes:author>`,
          ...(t.durationSec > 0
            ? [`      <itunes:duration>${t.durationSec}</itunes:duration>`]
            : []),
          ...(t.coverImage
            ? [`      <itunes:image href="${escapeXml(t.coverImage)}" />`]
            : []),
          '    </item>',
        ].join('\n');
      })
      .join('\n');

    const owner = ownerEmail
      ? [
          '    <itunes:owner>',
          `      <itunes:name>${escapeXml(author)}</itunes:name>`,
          `      <itunes:email>${escapeXml(ownerEmail)}</itunes:email>`,
          '    </itunes:owner>',
        ].join('\n') + '\n'
      : '';

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(site)}</link>
    <description>${cdata(description)}</description>
    <language>fr</language>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
    <itunes:author>${escapeXml(author)}</itunes:author>
    <itunes:image href="${escapeXml(image)}" />
    <itunes:explicit>false</itunes:explicit>
    <itunes:category text="Religion &amp; Spirituality">
      <itunes:category text="Christianity" />
    </itunes:category>
${owner}${items}
  </channel>
</rss>
`;
  }
}
