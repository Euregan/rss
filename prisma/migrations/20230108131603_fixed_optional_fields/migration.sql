/*
  Warnings:

  - You are about to drop the column `url` on the `Item` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Item_url_key";

-- AlterTable
ALTER TABLE "Feed" ALTER COLUMN "link" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "url",
ALTER COLUMN "link" DROP NOT NULL;
