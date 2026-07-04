/*
  Warnings:

  - You are about to drop the `sermon_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sermons` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "sermons" DROP CONSTRAINT "sermons_categoryId_fkey";

-- DropTable
DROP TABLE "sermon_categories";

-- DropTable
DROP TABLE "sermons";
