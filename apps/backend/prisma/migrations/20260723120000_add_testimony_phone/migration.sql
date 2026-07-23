-- Nullable pour préserver les témoignages historiques.
-- Les nouvelles soumissions rendent le numéro obligatoire via CreateTestimonyDto.
ALTER TABLE "testimonies" ADD COLUMN "phone" TEXT;
