-- CreateTable
CREATE TABLE "video_teachings" (
    "id" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnailUrl" TEXT,
    "durationSec" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "status" "TeachingStatus" NOT NULL DEFAULT 'PUBLISHED',
    "position" INTEGER NOT NULL DEFAULT 0,
    "themeId" TEXT,
    "speakerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_teachings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "video_teachings_youtubeId_key" ON "video_teachings"("youtubeId");

-- CreateIndex
CREATE INDEX "video_teachings_status_isAvailable_publishedAt_idx" ON "video_teachings"("status", "isAvailable", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "video_teachings_themeId_idx" ON "video_teachings"("themeId");

-- AddForeignKey
ALTER TABLE "video_teachings" ADD CONSTRAINT "video_teachings_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "teaching_themes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_teachings" ADD CONSTRAINT "video_teachings_speakerId_fkey" FOREIGN KEY ("speakerId") REFERENCES "speakers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
