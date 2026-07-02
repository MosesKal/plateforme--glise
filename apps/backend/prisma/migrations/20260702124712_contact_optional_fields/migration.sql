-- AlterTable
ALTER TABLE "contact_messages" ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "subject" DROP NOT NULL,
ALTER COLUMN "message" DROP NOT NULL;
