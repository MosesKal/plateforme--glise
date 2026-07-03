import { Injectable, Logger } from '@nestjs/common';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export interface AudioProbeResult {
  durationSec: number;
  bitRate: number | null;
  format: string | null;
}

/**
 * Extraction des métadonnées audio via ffprobe.
 *
 * ffprobe ne lit que les en-têtes (< 1 s même sur un fichier de 100 Mo), donc
 * l'appel est fait de façon synchrone dans la requête d'upload. Dégradation
 * gracieuse : si ffprobe est absent (poste de dev), on retourne null et la
 * durée reste à 0 — corrigeable plus tard par re-probe.
 */
@Injectable()
export class MediaProbeService {
  private readonly logger = new Logger(MediaProbeService.name);
  private readonly ffprobePath = process.env.FFPROBE_PATH?.trim() || 'ffprobe';

  async probe(filePath: string): Promise<AudioProbeResult | null> {
    try {
      const { stdout } = await execFileAsync(this.ffprobePath, [
        '-v',
        'error',
        '-show_entries',
        'format=duration,bit_rate,format_name',
        '-of',
        'json',
        filePath,
      ]);
      const format = JSON.parse(stdout)?.format;
      if (!format) return null;

      return {
        durationSec: Math.round(Number(format.duration) || 0),
        bitRate: format.bit_rate ? Number(format.bit_rate) : null,
        format: format.format_name ?? null,
      };
    } catch (err) {
      this.logger.warn(
        `ffprobe indisponible ou fichier illisible (${filePath}): ${err instanceof Error ? err.message : err}`,
      );
      return null;
    }
  }
}
