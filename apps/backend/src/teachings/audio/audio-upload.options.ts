import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import { mkdirSync } from 'fs';
import { extname } from 'path';
import { getUploadTmpDir } from '../../storage/storage.config';

export const AUDIO_ALLOWED_EXTENSIONS =
  /\.(mp3|mpeg|mpga|m4a|aac|wav|ogg|oga|opus|flac)$/i;

/**
 * Filet de sécurité : certains fichiers audio valides arrivent avec une
 * extension atypique (ex. « .mpeg » pour du MPEG audio) mais un type MIME
 * correct remonté par le navigateur. On accepte alors sur la base du MIME.
 */
export const AUDIO_ALLOWED_MIMETYPES = /^audio\//i;

/** 500 Mo — largement au-dessus d'une prédication de 2 h en MP3 192 kbps. */
export const AUDIO_MAX_FILE_SIZE = 500 * 1024 * 1024;

/**
 * Upload vers un répertoire temporaire situé sur le MÊME volume que
 * MEDIA_ROOT : le déplacement final par le StorageProvider est alors un
 * rename atomique (pas de copie, pas de fichier à moitié écrit servi).
 * Le nom original ne touche jamais le disque (UUID généré).
 */
export const audioUploadOptions: MulterOptions = {
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      const dir = getUploadTmpDir();
      mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      cb(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`);
    },
  }),
  limits: { fileSize: AUDIO_MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const extOk = AUDIO_ALLOWED_EXTENSIONS.test(extname(file.originalname));
    const mimeOk = AUDIO_ALLOWED_MIMETYPES.test(file.mimetype);
    if (extOk || mimeOk) {
      cb(null, true);
    } else {
      cb(
        new BadRequestException(
          'Format audio non supporté (mp3, mpeg, m4a, aac, wav, ogg, opus, flac)',
        ),
        false,
      );
    }
  },
};
