-- Migration manuelle : corrige les URLs des fichiers uploadés
-- Avant : http://localhost:3001/uploads/<file>       (host localhost + ancien préfixe)
-- Après : https://dev.impactgroup.cd/api/v1/uploads/<file>
--
-- Contexte : le backend renvoyait des URLs localhost et servait les statiques
-- hors du préfixe /api/v1. Corrigé dans main.ts + upload.controller.ts + .env.
-- Ce script rattrape les enregistrements créés avant le fix.
--
-- REPLACE ne touche que les lignes contenant l'ancienne chaîne : idempotent et sûr.

BEGIN;

UPDATE users            SET "avatarUrl"  = REPLACE("avatarUrl",  'http://localhost:3001/uploads/', 'https://dev.impactgroup.cd/api/v1/uploads/') WHERE "avatarUrl"  LIKE 'http://localhost:3001/uploads/%';
UPDATE extensions       SET "coverImage" = REPLACE("coverImage", 'http://localhost:3001/uploads/', 'https://dev.impactgroup.cd/api/v1/uploads/') WHERE "coverImage" LIKE 'http://localhost:3001/uploads/%';
UPDATE leaders          SET "photoUrl"   = REPLACE("photoUrl",   'http://localhost:3001/uploads/', 'https://dev.impactgroup.cd/api/v1/uploads/') WHERE "photoUrl"   LIKE 'http://localhost:3001/uploads/%';
UPDATE events           SET "coverImage" = REPLACE("coverImage", 'http://localhost:3001/uploads/', 'https://dev.impactgroup.cd/api/v1/uploads/') WHERE "coverImage" LIKE 'http://localhost:3001/uploads/%';
UPDATE albums           SET "coverUrl"   = REPLACE("coverUrl",   'http://localhost:3001/uploads/', 'https://dev.impactgroup.cd/api/v1/uploads/') WHERE "coverUrl"   LIKE 'http://localhost:3001/uploads/%';
UPDATE gallery_items    SET "mediaUrl"   = REPLACE("mediaUrl",   'http://localhost:3001/uploads/', 'https://dev.impactgroup.cd/api/v1/uploads/') WHERE "mediaUrl"   LIKE 'http://localhost:3001/uploads/%';
UPDATE sermons          SET "coverImage" = REPLACE("coverImage", 'http://localhost:3001/uploads/', 'https://dev.impactgroup.cd/api/v1/uploads/') WHERE "coverImage" LIKE 'http://localhost:3001/uploads/%';
UPDATE sermons          SET "audioUrl"   = REPLACE("audioUrl",   'http://localhost:3001/uploads/', 'https://dev.impactgroup.cd/api/v1/uploads/') WHERE "audioUrl"   LIKE 'http://localhost:3001/uploads/%';
UPDATE sermons          SET "pdfUrl"     = REPLACE("pdfUrl",     'http://localhost:3001/uploads/', 'https://dev.impactgroup.cd/api/v1/uploads/') WHERE "pdfUrl"     LIKE 'http://localhost:3001/uploads/%';
UPDATE sermons          SET "videoUrl"   = REPLACE("videoUrl",   'http://localhost:3001/uploads/', 'https://dev.impactgroup.cd/api/v1/uploads/') WHERE "videoUrl"   LIKE 'http://localhost:3001/uploads/%';
UPDATE departments      SET "photoUrl"   = REPLACE("photoUrl",   'http://localhost:3001/uploads/', 'https://dev.impactgroup.cd/api/v1/uploads/') WHERE "photoUrl"   LIKE 'http://localhost:3001/uploads/%';
UPDATE testimonies      SET "photoUrl"   = REPLACE("photoUrl",   'http://localhost:3001/uploads/', 'https://dev.impactgroup.cd/api/v1/uploads/') WHERE "photoUrl"   LIKE 'http://localhost:3001/uploads/%';
UPDATE site_pages       SET "coverUrl"   = REPLACE("coverUrl",   'http://localhost:3001/uploads/', 'https://dev.impactgroup.cd/api/v1/uploads/') WHERE "coverUrl"   LIKE 'http://localhost:3001/uploads/%';

COMMIT;
