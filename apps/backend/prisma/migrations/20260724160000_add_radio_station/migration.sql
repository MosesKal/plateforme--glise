-- CreateTable
CREATE TABLE "radio_stations" (
    "id" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "nameEn" TEXT,
    "descriptionFr" TEXT,
    "descriptionEn" TEXT,
    "streamUrl" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "coverImage" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "radio_stations_pkey" PRIMARY KEY ("id")
);

-- Une seule station peut être active, tout en autorisant plusieurs stations
-- inactives pour une évolution future du module.
CREATE UNIQUE INDEX "radio_stations_single_active_idx"
ON "radio_stations" ("isActive")
WHERE "isActive" = true;

CREATE INDEX "radio_stations_isActive_idx"
ON "radio_stations" ("isActive");
