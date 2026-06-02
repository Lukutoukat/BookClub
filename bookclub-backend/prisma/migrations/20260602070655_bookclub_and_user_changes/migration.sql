/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `BookClub` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[invite_code]` on the table `BookClub` will be added. If there are existing duplicate values, this will fail.
  - Made the column `name` on table `BookClub` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "user_id" INTEGER;

-- AlterTable
ALTER TABLE "BookClub" ADD COLUMN     "invite_code" TEXT,
ALTER COLUMN "name" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BookClub_name_key" ON "BookClub"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BookClub_invite_code_key" ON "BookClub"("invite_code");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
