/*
  Warnings:

  - You are about to drop the column `bookClubId` on the `BookProposed` table. All the data in the column will be lost.
  - You are about to drop the column `bookClubId` on the `BookVoted` table. All the data in the column will be lost.
  - You are about to drop the column `bookId` on the `BookVoted` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "BookProposed" DROP CONSTRAINT "BookProposed_bookClubId_fkey";

-- DropForeignKey
ALTER TABLE "BookVoted" DROP CONSTRAINT "BookVoted_bookClubId_fkey";

-- DropForeignKey
ALTER TABLE "BookVoted" DROP CONSTRAINT "BookVoted_bookId_fkey";

-- AlterTable
ALTER TABLE "BookProposed" DROP COLUMN "bookClubId";

-- AlterTable
ALTER TABLE "BookVoted" DROP COLUMN "bookClubId",
DROP COLUMN "bookId";
