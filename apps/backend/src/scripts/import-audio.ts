/**
 * Import de masse de la bibliothèque audio existante.
 *
 * Structure attendue : chaque sous-dossier de premier niveau est un thème,
 * les fichiers audio qu'il contient deviennent des enseignements. Un orateur
 * unique est assigné à tout l'import (bibliothèque mono-prédicateur).
 *
 *   bibliotheque/
 *     La foi/
 *       01 - Marcher par la foi.mp3
 *       02 - La foi qui deplace les montagnes.mp3
 *     La priere/
 *       ...
 *
 * Le script bootstrape le contexte Nest et passe par AudioTeachingsService
 * .create() : slug unique, position par thème et transcodage AAC 96k suivent
 * exactement le même chemin qu'un upload via le backoffice. Les fichiers
 * source sont COPIÉS (jamais déplacés) : la bibliothèque d'origine est
 * intacte. Relançable sans doublons — un enseignement portant le même titre
 * dans le même thème est ignoré.
 *
 *   pnpm --filter @cecj/backend import:audio -- --dir <chemin> --speaker "Nom" [--status DRAFT] [--dry-run]
 *   node dist/scripts/import-audio.js --dir <chemin> --speaker "Nom"           (VPS, après build)
 */
import { NestFactory } from '@nestjs/core';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import { extname, join } from 'path';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { STORAGE_PROVIDER } from '../storage/storage-provider.interface';
import type { StorageProvider } from '../storage/storage-provider.interface';
import { getUploadTmpDir } from '../storage/storage.config';
import { AUDIO_ALLOWED_EXTENSIONS } from '../teachings/audio/audio-upload.options';
import { AudioTeachingsService } from '../teachings/audio/audio-teachings.service';
import {
  AudioUploadsService,
  extensionForAudioMimeType,
} from '../teachings/audio/audio-uploads.service';
import { TeachingStatusDto } from '../teachings/audio/dto/create-audio-teaching.dto';
import { MediaProbeService } from '../teachings/audio/media-probe.service';
import { slugify } from '../teachings/common/slug.util';
import { parseImportArgs, titleFromFilename } from './import-audio.helpers';

interface PlannedFile {
  path: string;
  filename: string;
  title: string;
}

interface PlannedTheme {
  name: string;
  files: PlannedFile[];
}

/** Un transcodage qui ne progresse plus pendant 25 min est considéré bloqué. */
const TRANSCODE_STALL_MS = 25 * 60 * 1000;

async function scanLibrary(
  dir: string,
): Promise<{ themes: PlannedTheme[]; warnings: string[] }> {
  const warnings: string[] = [];
  const themes: PlannedTheme[] = [];

  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries.sort((a, b) =>
    a.name.localeCompare(b.name, 'fr'),
  )) {
    if (!entry.isDirectory()) {
      warnings.push(`Ignoré (hors dossier de thème) : ${entry.name}`);
      continue;
    }

    const themeDir = join(dir, entry.name);
    const files: PlannedFile[] = [];
    for (const file of (
      await fs.readdir(themeDir, { withFileTypes: true })
    ).sort((a, b) => a.name.localeCompare(b.name, 'fr'))) {
      if (!file.isFile()) {
        warnings.push(
          `Ignoré (sous-dossier non supporté) : ${entry.name}/${file.name}`,
        );
        continue;
      }
      if (!AUDIO_ALLOWED_EXTENSIONS.test(extname(file.name))) {
        warnings.push(
          `Ignoré (pas un fichier audio) : ${entry.name}/${file.name}`,
        );
        continue;
      }
      files.push({
        path: join(themeDir, file.name),
        filename: file.name,
        title: titleFromFilename(file.name),
      });
    }

    if (files.length === 0) {
      warnings.push(`Ignoré (aucun fichier audio) : ${entry.name}/`);
      continue;
    }
    themes.push({ name: entry.name, files });
  }

  return { themes, warnings };
}

async function main(): Promise<void> {
  const options = parseImportArgs(process.argv.slice(2));

  const { themes, warnings } = await scanLibrary(options.dir);
  if (themes.length === 0) {
    throw new Error(
      `Aucun dossier de thème contenant de l'audio dans "${options.dir}"`,
    );
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['warn', 'error'],
  });

  const summary = { imported: 0, skipped: 0, failed: 0, themesCreated: 0 };
  const importedIds: string[] = [];

  try {
    const prisma = app.get(PrismaService);
    const teachings = app.get(AudioTeachingsService);
    const uploads = app.get(AudioUploadsService);
    const probe = app.get(MediaProbeService);
    const storage = app.get<StorageProvider>(STORAGE_PROVIDER);

    // ── Orateur unique de l'import ────────────────────────────────────────────
    const speakerSlug = slugify(options.speaker);
    let speaker = await prisma.speaker.findUnique({
      where: { slug: speakerSlug },
    });
    const speakerExisted = Boolean(speaker);
    if (!speaker && !options.dryRun) {
      speaker = await prisma.speaker.create({
        data: { slug: speakerSlug, fullName: options.speaker.trim() },
      });
    }
    console.log(
      speakerExisted
        ? `Orateur : ${speaker!.fullName} (existant)`
        : `Orateur : ${options.speaker} (${options.dryRun ? 'sera créé' : 'créé'})`,
    );

    // ── Thèmes puis fichiers, dans l'ordre alphabétique du scan ──────────────
    for (const plannedTheme of themes) {
      const themeSlug = slugify(plannedTheme.name);
      let theme = await prisma.teachingTheme.findUnique({
        where: { slug: themeSlug },
      });
      const themeExisted = Boolean(theme);

      if (!theme) {
        summary.themesCreated++;
        if (!options.dryRun) {
          const last = await prisma.teachingTheme.findFirst({
            orderBy: { position: 'desc' },
            select: { position: true },
          });
          theme = await prisma.teachingTheme.create({
            data: {
              slug: themeSlug,
              nameFr: plannedTheme.name,
              position: (last?.position ?? -1) + 1,
            },
          });
        }
      }
      console.log(
        `\nThème « ${plannedTheme.name} » (${themeExisted ? 'existant' : 'nouveau'}) — ${plannedTheme.files.length} fichier(s)`,
      );

      for (const file of plannedTheme.files) {
        // Idempotence : même titre dans le même thème = déjà importé.
        const existing = theme
          ? await prisma.audioTeaching.findFirst({
              where: {
                themeId: theme.id,
                title: { equals: file.title, mode: 'insensitive' },
              },
              select: { id: true },
            })
          : null;
        if (existing) {
          summary.skipped++;
          console.log(`  = ${file.title} (déjà importé, ignoré)`);
          continue;
        }

        if (options.dryRun) {
          summary.imported++;
          console.log(`  + ${file.title}  ←  ${file.filename}`);
          continue;
        }

        try {
          const [stat, probed] = await Promise.all([
            fs.stat(file.path),
            probe.probe(file.path),
          ]);

          if (!probed) {
            throw new Error('Le fichier ne contient pas de flux audio valide');
          }
          const extension = extensionForAudioMimeType(probed.mimeType);
          if (!extension) {
            throw new Error(
              'Le conteneur audio détecté n’est pas pris en charge',
            );
          }
          const stagingKey = `audio/staged/import/${new Date().getUTCFullYear()}/${randomUUID()}${extension}`;

          // Copie vers le tmp d'upload puis save() : même volume que
          // MEDIA_ROOT, le déplacement final est un rename atomique.
          const tmpPath = join(
            getUploadTmpDir(),
            `${randomUUID()}${extension}`,
          );
          await fs.mkdir(getUploadTmpDir(), { recursive: true });
          await fs.copyFile(file.path, tmpPath);
          await storage.save(tmpPath, stagingKey);
          const { uploadId } = await uploads.registerStoredStaged({
            stagingKey,
            originalName: file.filename,
            detectedMimeType: probed.mimeType,
            fileSize: stat.size,
            durationSec: probed.durationSec,
          });

          const created = await teachings.create(
            {
              title: file.title,
              themeId: theme!.id,
              speakerId: speaker!.id,
              status: options.status as TeachingStatusDto,
              uploadId,
            },
            'system-import',
          );

          importedIds.push(created.id);
          summary.imported++;
          console.log(`  + ${file.title}`);
        } catch (err) {
          summary.failed++;
          console.error(
            `  ✗ ${file.filename} : ${err instanceof Error ? err.message : err}`,
          );
        }
      }
    }

    // ── Transcodage : la file FIFO vit dans CE process, on attend le drain ───
    if (importedIds.length > 0) {
      console.log(`\nTranscodage AAC 96k de ${importedIds.length} fichier(s)…`);
      let lastRemaining = Infinity;
      let lastProgressAt = Date.now();

      for (;;) {
        const remaining = await prisma.audioTeaching.count({
          where: {
            id: { in: importedIds },
            processing: { in: ['PENDING', 'PROCESSING'] },
          },
        });
        if (remaining === 0) break;

        if (remaining < lastRemaining) {
          lastRemaining = remaining;
          lastProgressAt = Date.now();
          console.log(`  … ${remaining} restant(s)`);
        } else if (Date.now() - lastProgressAt > TRANSCODE_STALL_MS) {
          console.warn(
            '  Transcodage sans progression depuis 25 min — abandon de l’attente. ' +
              'Les fichiers restent écoutables (original servi) ; le serveur API ' +
              'reprendra les lignes PENDING à son prochain démarrage.',
          );
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      const failed = await prisma.audioTeaching.count({
        where: { id: { in: importedIds }, processing: 'FAILED' },
      });
      if (failed > 0) {
        console.warn(
          `  ${failed} transcodage(s) en échec — les originaux restent servis tels quels.`,
        );
      }
    }
  } finally {
    await app.close();
  }

  for (const warning of warnings) console.warn(`\n⚠ ${warning}`);
  console.log(
    `\n${options.dryRun ? '[DRY-RUN] ' : ''}Terminé : ${summary.imported} importé(s), ` +
      `${summary.skipped} ignoré(s), ${summary.failed} échec(s), ` +
      `${summary.themesCreated} thème(s) créé(s).`,
  );

  if (summary.failed > 0) process.exitCode = 1;
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
