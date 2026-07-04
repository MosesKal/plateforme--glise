import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { execFile } from 'child_process';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import { PrismaService } from '../../prisma/prisma.service';
import { STORAGE_PROVIDER } from '../../storage/storage-provider.interface';
import type { StorageProvider } from '../../storage/storage-provider.interface';
import { getUploadTmpDir } from '../../storage/storage.config';
import { MediaProbeService } from './media-probe.service';

const execFileAsync = promisify(execFile);

/** Suffixe des fichiers produits par le pipeline — sert aussi de marqueur « déjà optimisé ». */
const OPTIMIZED_SUFFIX = '-96k.m4a';

/** 20 min : marge large pour une prédication de 2 h sur un petit VPS. */
const FFMPEG_TIMEOUT_MS = 20 * 60 * 1000;

/**
 * Pipeline de transcodage audio asynchrone (phase 2 du module Enseignements).
 *
 * À la création/remplacement d'un fichier, l'original est servi immédiatement
 * (processing=PENDING) pendant qu'un worker le ré-encode en AAC-LC 96 kbps
 * (`-movflags +faststart` : les métadonnées passent en tête de fichier, la
 * lecture démarre sans télécharger la fin). Une fois prêt, le fileKey bascule
 * vers le .m4a et l'original est supprimé.
 *
 * Choix assumés (voir roadmap) :
 * - File FIFO en mémoire, concurrence 1 — pas de Redis/BullMQ. La colonne
 *   `processing` en DB est la source de vérité : au redémarrage, les lignes
 *   PENDING/PROCESSING sont ré-enfilées, donc aucun job n'est perdu.
 * - Échec ffmpeg → FAILED mais le fileKey original reste en place : un
 *   enseignement « non optimisé » reste écoutable, jamais cassé.
 * - ffmpeg absent (poste de dev Windows) → READY sur l'original, simple warn.
 */
@Injectable()
export class AudioTranscodeService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AudioTranscodeService.name);
  private readonly ffmpegPath = process.env.FFMPEG_PATH?.trim() || 'ffmpeg';

  private readonly queue: string[] = [];
  private draining = false;
  private ffmpegAvailable?: boolean;

  constructor(
    private prisma: PrismaService,
    private mediaProbe: MediaProbeService,
    @Inject(STORAGE_PROVIDER) private storage: StorageProvider,
  ) {}

  onApplicationBootstrap() {
    // Sans await : la reprise des jobs interrompus ne doit pas retarder le boot.
    void this.recoverInterrupted();
  }

  /** Enfile un enseignement à transcoder (idempotent tant qu'il est en file). */
  enqueue(teachingId: string): void {
    if (this.queue.includes(teachingId)) return;
    this.queue.push(teachingId);
    void this.drain();
  }

  // ─── Worker ─────────────────────────────────────────────────────────────────

  private async drain(): Promise<void> {
    if (this.draining) return;
    this.draining = true;
    try {
      let id: string | undefined;
      while ((id = this.queue.shift()) !== undefined) {
        try {
          await this.processOne(id);
        } catch (err) {
          // processOne gère ses erreurs ; ceci ne protège que la boucle elle-même.
          this.logger.error(`Job de transcodage ${id} interrompu : ${err}`);
        }
      }
    } finally {
      this.draining = false;
    }
  }

  private async processOne(id: string): Promise<void> {
    const teaching = await this.prisma.audioTeaching.findUnique({
      where: { id },
      select: { id: true, fileKey: true, processing: true },
    });
    // Supprimé entre-temps, sans fichier, ou déjà traité : rien à faire.
    if (!teaching?.fileKey) return;
    if (teaching.processing === 'READY' || teaching.processing === 'FAILED') {
      return;
    }

    const sourceKey = teaching.fileKey;

    // Déjà au format cible : reprise après un redémarrage survenu juste après le swap.
    if (sourceKey.endsWith(OPTIMIZED_SUFFIX)) {
      await this.setProcessing(id, sourceKey, 'READY');
      return;
    }

    if (!(await this.isFfmpegAvailable())) {
      await this.setProcessing(id, sourceKey, 'READY');
      return;
    }

    const sourcePath = this.storage.getLocalPath(sourceKey);
    if (!sourcePath) {
      // Provider sans accès disque (futur S3/R2) : le transcodage devra
      // télécharger la source — hors périmètre tant que le stockage est local.
      this.logger.warn(
        `Transcodage ignoré pour "${sourceKey}" : provider sans chemin local`,
      );
      await this.setProcessing(id, sourceKey, 'READY');
      return;
    }

    await this.setProcessing(id, sourceKey, 'PROCESSING');

    const tmpDir = getUploadTmpDir();
    const tmpOut = join(tmpDir, `${randomUUID()}.m4a`);

    try {
      await fs.mkdir(tmpDir, { recursive: true });
      // -vn écarte les pochettes embarquées (flux vidéo parasite en MP4).
      await execFileAsync(
        this.ffmpegPath,
        ['-hide_banner', '-loglevel', 'error', '-y', '-i', sourcePath,
          '-vn', '-map_metadata', '0', '-c:a', 'aac', '-b:a', '96k',
          '-movflags', '+faststart', tmpOut],
        { timeout: FFMPEG_TIMEOUT_MS },
      );

      const [probe, stat] = await Promise.all([
        this.mediaProbe.probe(tmpOut),
        fs.stat(tmpOut),
      ]);

      const targetKey =
        sourceKey.replace(/\.[a-z0-9]+$/i, '') + OPTIMIZED_SUFFIX;
      await this.storage.save(tmpOut, targetKey);

      // Swap guardé sur le fileKey source : si l'admin a remplacé le fichier
      // pendant le transcodage, le résultat est obsolète et doit être jeté.
      const { count } = await this.prisma.audioTeaching.updateMany({
        where: { id, fileKey: sourceKey },
        data: {
          fileKey: targetKey,
          mimeType: 'audio/mp4',
          fileSize: stat.size,
          ...(probe && probe.durationSec > 0
            ? { durationSec: probe.durationSec }
            : {}),
          processing: 'READY',
        },
      });

      if (count === 0) {
        await this.storage.delete(targetKey);
        return;
      }

      // L'original n'est supprimé qu'une fois le swap DB confirmé.
      await this.storage.delete(sourceKey);
      this.logger.log(`Transcodage terminé : ${sourceKey} → ${targetKey}`);
    } catch (err) {
      await fs.unlink(tmpOut).catch(() => undefined);
      this.logger.error(`Transcodage échoué pour "${sourceKey}" : ${err}`);
      // FAILED = « non optimisé » : l'original reste servi, jamais de trou de lecture.
      await this.setProcessing(id, sourceKey, 'FAILED');
    }
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  /** Reprend les jobs interrompus par un redémarrage (PENDING/PROCESSING avec fichier). */
  private async recoverInterrupted(): Promise<void> {
    try {
      const interrupted = await this.prisma.audioTeaching.findMany({
        where: {
          processing: { in: ['PENDING', 'PROCESSING'] },
          fileKey: { not: null },
        },
        select: { id: true },
        orderBy: { updatedAt: 'asc' },
      });
      if (interrupted.length === 0) return;

      this.logger.log(
        `Reprise de ${interrupted.length} transcodage(s) interrompu(s)`,
      );
      for (const { id } of interrupted) this.enqueue(id);
    } catch (err) {
      this.logger.error(`Reprise des transcodages impossible : ${err}`);
    }
  }

  /** MàJ conditionnée au fileKey attendu — ne clobber jamais un fichier remplacé entre-temps. */
  private async setProcessing(
    id: string,
    expectedFileKey: string,
    status: 'PROCESSING' | 'READY' | 'FAILED',
  ): Promise<void> {
    await this.prisma.audioTeaching.updateMany({
      where: { id, fileKey: expectedFileKey },
      data: { processing: status },
    });
  }

  private async isFfmpegAvailable(): Promise<boolean> {
    if (this.ffmpegAvailable === undefined) {
      try {
        await execFileAsync(this.ffmpegPath, ['-version']);
        this.ffmpegAvailable = true;
      } catch {
        this.ffmpegAvailable = false;
        this.logger.warn(
          'ffmpeg introuvable : les fichiers seront servis sans transcodage (READY sur l’original)',
        );
      }
    }
    return this.ffmpegAvailable;
  }
}
