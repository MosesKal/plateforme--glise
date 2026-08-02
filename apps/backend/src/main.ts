import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { randomUUID } from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import { API_PREFIX } from './common/config/app-url';
import { getMediaRoot } from './storage/storage.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix(API_PREFIX);

  const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    const candidate = req.header('x-request-id')?.trim();
    const forwarded =
      candidate && /^[A-Za-z0-9._:-]{1,100}$/.test(candidate)
        ? candidate
        : undefined;
    const requestId = forwarded ?? randomUUID();
    (req as Request & { requestId: string }).requestId = requestId;
    res.setHeader('X-Request-Id', requestId);
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Serve uploaded files as static assets under the API prefix so they are
  // exposed through the same reverse proxy that routes /api/v1/* to the backend.
  // (useStaticAssets ignores setGlobalPrefix, so the prefix is set explicitly.)
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: `/${API_PREFIX}/uploads/`,
  });

  // Les uploads STAGED ne sont jamais publics. Cette protection couvre le
  // fallback Express ; Caddy applique la même règle avant son file_server.
  app.use('/media/audio/staged', (_req: Request, res: Response) => {
    res.sendStatus(404);
  });

  // Médias (enseignements audio…) sous /media/ : fallback Express avec support
  // des requêtes Range. En production, Caddy intercepte /media/ AVANT Node
  // (voir deploy/Caddyfile.example) — sendfile et Range natifs.
  app.useStaticAssets(getMediaRoot(), {
    prefix: '/media/',
    setHeaders: (res: Response) => {
      // Les clés de fichiers sont immuables (jamais réécrites) → cache long.
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    },
  });

  const port = process.env.PORT ?? 3001;
  const server = await app.listen(port);

  // Axios `timeout: 0` ne concerne que le navigateur. Node interrompt sinon
  // la réception d'une requête complète après 5 min. Le timeout reste borné
  // et configurable ; Caddy protège l'origine et limite la taille du body.
  server.requestTimeout =
    Number(process.env.UPLOAD_REQUEST_TIMEOUT_MS) || 45 * 60 * 1000;
  server.keepAliveTimeout =
    Number(process.env.HTTP_KEEP_ALIVE_TIMEOUT_MS) || 65_000;
  server.headersTimeout = Math.max(server.keepAliveTimeout + 1_000, 66_000);
  console.log(`Backend running on http://localhost:${port}/api/v1`);
}
void bootstrap();
