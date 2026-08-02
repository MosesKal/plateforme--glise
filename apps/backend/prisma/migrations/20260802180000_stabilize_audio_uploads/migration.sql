-- CreateEnum
CREATE TYPE "AudioMediaStatus" AS ENUM (
  'STAGED',
  'PROMOTING',
  'PENDING',
  'PROCESSING',
  'READY',
  'FAILED',
  'EXPIRED'
);

-- CreateTable
CREATE TABLE "audio_media_assets" (
  "id" TEXT NOT NULL,
  "storageKey" TEXT,
  "obsoleteStorageKey" TEXT,
  "stagingKey" TEXT,
  "originalName" TEXT NOT NULL,
  "detectedMimeType" TEXT NOT NULL,
  "fileSize" INTEGER NOT NULL,
  "durationSec" INTEGER NOT NULL,
  "checksumSha256" TEXT NOT NULL,
  "status" "AudioMediaStatus" NOT NULL DEFAULT 'STAGED',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "lastError" TEXT,
  "nextAttemptAt" TIMESTAMP(3),
  "leaseId" TEXT,
  "leaseExpiresAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "audio_media_assets_pkey" PRIMARY KEY ("id")
);

-- AlterTable (expand-only: legacy media columns are intentionally retained)
ALTER TABLE "audio_teachings" ADD COLUMN "mediaAssetId" TEXT;

-- Backfill one durable asset per existing teaching. The storage key may have
-- historical duplicates, but mediaAssetId remains one-to-one and all new
-- uploads receive UUID-based keys.
INSERT INTO "audio_media_assets" (
  "id",
  "storageKey",
  "stagingKey",
  "originalName",
  "detectedMimeType",
  "fileSize",
  "durationSec",
  "checksumSha256",
  "status",
  "attempts",
  "createdAt",
  "updatedAt"
)
SELECT
  'legacy_' || md5(a."id"),
  a."fileKey",
  NULL,
  regexp_replace(a."fileKey", '^.*/', ''),
  a."mimeType",
  a."fileSize",
  a."durationSec",
  'legacy:' || md5(a."fileKey"),
  CASE
    -- Les anciens déploiements pouvaient marquer READY quand ffmpeg était
    -- absent. Toute source non optimisée est donc remise dans la file durable.
    WHEN a."fileKey" !~ '-96k\.m4a$' THEN 'PENDING'::"AudioMediaStatus"
    WHEN a."processing"::text IN ('PROCESSING', 'PENDING')
      THEN 'PENDING'::"AudioMediaStatus"
    WHEN a."processing"::text = 'FAILED' THEN 'FAILED'::"AudioMediaStatus"
    ELSE 'READY'::"AudioMediaStatus"
  END,
  0,
  a."createdAt",
  CURRENT_TIMESTAMP
FROM "audio_teachings" a
WHERE a."fileKey" IS NOT NULL;

UPDATE "audio_teachings" a
SET "mediaAssetId" = 'legacy_' || md5(a."id")
WHERE a."fileKey" IS NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "audio_teachings_mediaAssetId_key"
  ON "audio_teachings"("mediaAssetId");
CREATE INDEX "audio_media_assets_status_expiresAt_idx"
  ON "audio_media_assets"("status", "expiresAt");
CREATE INDEX "audio_media_assets_status_nextAttemptAt_idx"
  ON "audio_media_assets"("status", "nextAttemptAt");
CREATE INDEX "audio_media_assets_storageKey_idx"
  ON "audio_media_assets"("storageKey");
CREATE INDEX "audio_media_assets_checksumSha256_idx"
  ON "audio_media_assets"("checksumSha256");

-- AddForeignKey
ALTER TABLE "audio_media_assets"
  ADD CONSTRAINT "audio_media_assets_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "audio_teachings"
  ADD CONSTRAINT "audio_teachings_mediaAssetId_fkey"
  FOREIGN KEY ("mediaAssetId") REFERENCES "audio_media_assets"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
