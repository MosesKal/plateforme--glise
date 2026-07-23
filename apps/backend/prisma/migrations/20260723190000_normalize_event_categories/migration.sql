-- Normalise les anciennes catégories sans supprimer les événements existants.
UPDATE "Event"
SET "category" = CASE
  WHEN "category" IN ('Louange & Adoration', 'Action de graces', 'Action de grâce')
    THEN 'Action de grâces'
  WHEN "category" IN ('École de Tyrannus', 'Ecole de Tyrannus')
    THEN 'Ecole de tyrannus'
  WHEN "category" = 'Concours Biblique'
    THEN 'Concours biblique'
  WHEN "category" IN (
    'Culte special',
    'Conférence des Femmes',
    'Conference des Femmes',
    'Rencontre des Mamans'
  )
    THEN 'Culte spécial'
  WHEN "category" IS NULL OR BTRIM("category") = ''
    THEN 'Culte spécial'
  ELSE 'Culte spécial'
END;
