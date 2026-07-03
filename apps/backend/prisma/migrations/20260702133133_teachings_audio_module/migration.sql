-- CreateEnum
CREATE TYPE "TeachingStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AudioProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'FAILED');

-- CreateTable
CREATE TABLE "speakers" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "title" TEXT,
    "bio" TEXT,
    "photoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "speakers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teaching_themes" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "nameEn" TEXT,
    "descriptionFr" TEXT,
    "coverImage" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teaching_themes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teaching_tags" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "teaching_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audio_teachings" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "preachedAt" TIMESTAMP(3),
    "durationSec" INTEGER NOT NULL DEFAULT 0,
    "fileKey" TEXT,
    "fileSize" INTEGER NOT NULL DEFAULT 0,
    "mimeType" TEXT NOT NULL DEFAULT 'audio/mpeg',
    "coverImage" TEXT,
    "status" "TeachingStatus" NOT NULL DEFAULT 'DRAFT',
    "processing" "AudioProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "position" INTEGER NOT NULL DEFAULT 0,
    "playCount" INTEGER NOT NULL DEFAULT 0,
    "themeId" TEXT NOT NULL,
    "speakerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audio_teachings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audio_teaching_tags" (
    "audioTeachingId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "audio_teaching_tags_pkey" PRIMARY KEY ("audioTeachingId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "speakers_slug_key" ON "speakers"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "teaching_themes_slug_key" ON "teaching_themes"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "teaching_tags_slug_key" ON "teaching_tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "teaching_tags_name_key" ON "teaching_tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "audio_teachings_slug_key" ON "audio_teachings"("slug");

-- CreateIndex
CREATE INDEX "audio_teachings_themeId_position_idx" ON "audio_teachings"("themeId", "position");

-- CreateIndex
CREATE INDEX "audio_teachings_status_preachedAt_idx" ON "audio_teachings"("status", "preachedAt" DESC);

-- CreateIndex
CREATE INDEX "audio_teachings_speakerId_idx" ON "audio_teachings"("speakerId");

-- AddForeignKey
ALTER TABLE "audio_teachings" ADD CONSTRAINT "audio_teachings_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "teaching_themes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audio_teachings" ADD CONSTRAINT "audio_teachings_speakerId_fkey" FOREIGN KEY ("speakerId") REFERENCES "speakers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audio_teaching_tags" ADD CONSTRAINT "audio_teaching_tags_audioTeachingId_fkey" FOREIGN KEY ("audioTeachingId") REFERENCES "audio_teachings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audio_teaching_tags" ADD CONSTRAINT "audio_teaching_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "teaching_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
