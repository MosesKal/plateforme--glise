import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export interface AudioProbeResult {
  durationSec: number;
  bitRate: number | null;
  format: string | null;
  codec: string;
  mimeType: string;
}

const FFPROBE_TIMEOUT_MS = 30_000;

function mimeTypeForFormat(format: string | null): string {
  const names = new Set((format ?? '').split(','));
  if (names.has('mp3') || names.has('mpeg')) return 'audio/mpeg';
  if (names.has('aac')) return 'audio/aac';
  if (names.has('mov') || names.has('mp4') || names.has('m4a')) {
    return 'audio/mp4';
  }
  if (names.has('wav')) return 'audio/wav';
  if (names.has('ogg')) return 'audio/ogg';
  if (names.has('flac')) return 'audio/flac';
  if (names.has('webm') || names.has('matroska')) return 'audio/webm';
  return 'application/octet-stream';
}

/**
 * Extraction des métadonnées audio via ffprobe.
 *
 * ffprobe ne lit que les en-têtes (< 1 s même sur un fichier de 100 Mo), donc
 * l'appel est fait dans la requête d'upload. Si ffprobe est absent ou si aucun
 * flux audio valide n'est détecté, l'upload est refusé : le MIME déclaré par le
 * navigateur n'est jamais considéré comme une preuve suffisante.
 */
@Injectable()
export class MediaProbeService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MediaProbeService.name);
  private readonly ffprobePath = process.env.FFPROBE_PATH?.trim() || 'ffprobe';
  private available = false;

  async onApplicationBootstrap(): Promise<void> {
    this.available = await this.checkAvailability();
    if (this.available) return;

    const message =
      'ffprobe introuvable : les nouveaux uploads audio seront refusés afin de ne pas publier de fichier non validé';
    if (process.env.NODE_ENV === 'production') this.logger.error(message);
    else this.logger.warn(message);
  }

  isAvailable(): boolean {
    return this.available;
  }

  async probe(filePath: string): Promise<AudioProbeResult | null> {
    try {
      const { stdout } = await execFileAsync(
        this.ffprobePath,
        [
          '-v',
          'error',
          '-select_streams',
          'a:0',
          '-show_entries',
          'stream=codec_type,codec_name:format=duration,bit_rate,format_name',
          '-of',
          'json',
          filePath,
        ],
        {
          timeout: FFPROBE_TIMEOUT_MS,
          maxBuffer: 1024 * 1024,
          windowsHide: true,
        },
      );
      const parsed = JSON.parse(stdout) as {
        streams?: { codec_type?: string; codec_name?: string }[];
        format?: {
          duration?: string;
          bit_rate?: string;
          format_name?: string;
        };
      };
      const stream = parsed.streams?.[0];
      const format = parsed.format;
      const durationSec = Math.round(Number(format?.duration) || 0);
      if (
        stream?.codec_type !== 'audio' ||
        !stream.codec_name ||
        durationSec <= 0
      ) {
        return null;
      }

      const formatName = format?.format_name ?? null;

      return {
        durationSec,
        bitRate: format?.bit_rate ? Number(format.bit_rate) : null,
        format: formatName,
        codec: stream.codec_name,
        mimeType: mimeTypeForFormat(formatName),
      };
    } catch (err) {
      this.logger.warn(
        `ffprobe indisponible ou fichier illisible (${filePath}): ${err instanceof Error ? err.message : err}`,
      );
      return null;
    }
  }

  private async checkAvailability(): Promise<boolean> {
    try {
      await execFileAsync(this.ffprobePath, ['-version'], {
        timeout: 5_000,
        windowsHide: true,
      });
      return true;
    } catch {
      return false;
    }
  }
}
