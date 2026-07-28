-- Le champ "content" existant reste la version originale reçue.
-- Les corrections éditoriales sont conservées séparément afin de ne jamais
-- écraser le message soumis par le membre.
ALTER TABLE "testimonies"
ADD COLUMN "editedContent" TEXT,
ADD COLUMN "editedAt" TIMESTAMP(3);
