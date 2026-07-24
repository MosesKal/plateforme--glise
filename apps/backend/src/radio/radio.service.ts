import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TestRadioStreamDto } from './dto/test-radio-stream.dto';
import { UpsertRadioStationDto } from './dto/upsert-radio-station.dto';

const PUBLIC_SELECT = {
  id: true,
  nameFr: true,
  nameEn: true,
  descriptionFr: true,
  descriptionEn: true,
  streamUrl: true,
  websiteUrl: true,
  coverImage: true,
} satisfies Prisma.RadioStationSelect;

const TEST_TIMEOUT_MS = 5_000;
const MAX_REDIRECTS = 2;

@Injectable()
export class RadioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  findPublic() {
    return this.prisma.radioStation.findFirst({
      where: { isActive: true },
      select: PUBLIC_SELECT,
    });
  }

  findAdmin() {
    return this.prisma.radioStation.findFirst({
      orderBy: { createdAt: 'asc' },
    });
  }

  async upsert(dto: UpsertRadioStationDto) {
    this.assertSafeStreamUrl(dto.streamUrl);
    const existing = await this.findAdmin();
    const data = this.toPersistenceData(dto);

    return this.prisma.$transaction(async (tx) => {
      if (dto.isActive) {
        await tx.radioStation.updateMany({
          where: existing
            ? { isActive: true, id: { not: existing.id } }
            : { isActive: true },
          data: { isActive: false },
        });
      }

      return existing
        ? tx.radioStation.update({ where: { id: existing.id }, data })
        : tx.radioStation.create({ data });
    });
  }

  async testStream(dto: TestRadioStreamDto) {
    let currentUrl = new URL(dto.streamUrl);

    for (
      let redirectCount = 0;
      redirectCount <= MAX_REDIRECTS;
      redirectCount += 1
    ) {
      this.assertSafeStreamUrl(currentUrl.toString());

      let response: Response;
      try {
        response = await fetch(currentUrl, {
          method: 'GET',
          redirect: 'manual',
          signal: AbortSignal.timeout(TEST_TIMEOUT_MS),
          headers: {
            Accept: 'audio/*,*/*;q=0.5',
            Range: 'bytes=0-0',
            'User-Agent': 'CECJC-Radio-Healthcheck/1.0',
          },
        });
      } catch {
        throw new ServiceUnavailableException(
          'Le flux radio est temporairement inaccessible',
        );
      }

      if (response.status >= 300 && response.status < 400) {
        await response.body?.cancel();
        const location = response.headers.get('location');
        if (!location || redirectCount === MAX_REDIRECTS) {
          throw new ServiceUnavailableException(
            'Le flux radio redirige vers une destination non vérifiable',
          );
        }
        currentUrl = new URL(location, currentUrl);
        continue;
      }

      const contentType = response.headers.get('content-type');
      await response.body?.cancel();
      if (!response.ok && response.status !== 206) {
        throw new ServiceUnavailableException(
          `Le flux radio a répondu avec le statut ${response.status}`,
        );
      }

      return {
        reachable: true,
        statusCode: response.status,
        contentType,
      };
    }

    throw new ServiceUnavailableException('Le flux radio est inaccessible');
  }

  private toPersistenceData(
    dto: UpsertRadioStationDto,
  ): Prisma.RadioStationUncheckedCreateInput {
    return {
      nameFr: dto.nameFr,
      nameEn: this.optional(dto.nameEn),
      descriptionFr: this.optional(dto.descriptionFr),
      descriptionEn: this.optional(dto.descriptionEn),
      streamUrl: dto.streamUrl,
      websiteUrl: this.optional(dto.websiteUrl),
      coverImage: this.optional(dto.coverImage),
      isActive: dto.isActive,
    };
  }

  private optional(value: string | undefined): string | null {
    return value?.trim() || null;
  }

  private assertSafeStreamUrl(rawUrl: string): void {
    let url: URL;
    try {
      url = new URL(rawUrl);
    } catch {
      throw new BadRequestException('URL du flux radio invalide');
    }

    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      (url.port && url.port !== '443')
    ) {
      throw new BadRequestException(
        'Le flux radio doit être une URL HTTPS publique sans identifiants',
      );
    }

    const hostname = url.hostname.toLowerCase().replace(/\.$/, '');
    const allowed = this.allowedHosts();
    const isAllowed = allowed.some(
      (host) => hostname === host || hostname.endsWith(`.${host}`),
    );
    if (!isAllowed) {
      throw new BadRequestException(
        `Domaine de streaming non autorisé. Domaines acceptés : ${allowed.join(', ')}`,
      );
    }
  }

  private allowedHosts(): string[] {
    const configured = this.config.get<string>(
      'RADIO_STREAM_ALLOWED_HOSTS',
      'stream.zeno.fm,zeno.fm',
    );
    return configured
      .split(',')
      .map((host) => host.trim().toLowerCase().replace(/^\./, ''))
      .filter(Boolean);
  }
}
