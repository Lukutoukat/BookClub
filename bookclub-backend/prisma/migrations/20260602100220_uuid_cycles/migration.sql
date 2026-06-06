/*
  Warnings:

  - The primary key for the `Book` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `BookClub` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `BookClubMembers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `BookProposed` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `bookclub_id` on the `BookProposed` table. All the data in the column will be lost.
  - The primary key for the `BookSaved` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `BookVoted` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `book_id` on the `BookVoted` table. All the data in the column will be lost.
  - You are about to drop the column `bookclub_id` on the `BookVoted` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `BookVoted` table. All the data in the column will be lost.
  - The primary key for the `Invite` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Book" DROP CONSTRAINT "Book_user_id_fkey";

-- DropForeignKey
ALTER TABLE "BookClub" DROP CONSTRAINT "BookClub_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "BookClubMembers" DROP CONSTRAINT "BookClubMembers_bookclub_id_fkey";

-- DropForeignKey
ALTER TABLE "BookClubMembers" DROP CONSTRAINT "BookClubMembers_user_id_fkey";

-- DropForeignKey
ALTER TABLE "BookProposed" DROP CONSTRAINT "BookProposed_book_id_fkey";

-- DropForeignKey
ALTER TABLE "BookProposed" DROP CONSTRAINT "BookProposed_bookclub_id_fkey";

-- DropForeignKey
ALTER TABLE "BookSaved" DROP CONSTRAINT "BookSaved_book_id_fkey";

-- DropForeignKey
ALTER TABLE "BookSaved" DROP CONSTRAINT "BookSaved_user_id_fkey";

-- DropForeignKey
ALTER TABLE "BookVoted" DROP CONSTRAINT "BookVoted_book_id_fkey";

-- DropForeignKey
ALTER TABLE "BookVoted" DROP CONSTRAINT "BookVoted_bookclub_id_fkey";

-- DropForeignKey
ALTER TABLE "BookVoted" DROP CONSTRAINT "BookVoted_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_bookclub_id_fkey";

-- AlterTable
ALTER TABLE "Book" DROP CONSTRAINT "Book_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Book_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Book_id_seq";

-- AlterTable
ALTER TABLE "BookClub" DROP CONSTRAINT "BookClub_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "owner_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "BookClub_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "BookClub_id_seq";

-- AlterTable
ALTER TABLE "BookClubMembers" DROP CONSTRAINT "BookClubMembers_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "bookclub_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "BookClubMembers_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "BookClubMembers_id_seq";

-- AlterTable
ALTER TABLE "BookProposed" DROP CONSTRAINT "BookProposed_pkey",
DROP COLUMN "bookclub_id",
ADD COLUMN     "bookClubId" TEXT,
ADD COLUMN     "cycle_id" TEXT,
ADD COLUMN     "user_id" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "book_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "BookProposed_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "BookProposed_id_seq";

-- AlterTable
ALTER TABLE "BookSaved" DROP CONSTRAINT "BookSaved_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "book_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "BookSaved_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "BookSaved_id_seq";

-- AlterTable
ALTER TABLE "BookVoted" DROP CONSTRAINT "BookVoted_pkey",
DROP COLUMN "book_id",
DROP COLUMN "bookclub_id",
DROP COLUMN "score",
ADD COLUMN     "bookClubId" TEXT,
ADD COLUMN     "bookId" TEXT,
ADD COLUMN     "proposal_id" TEXT,
ADD COLUMN     "weight" INTEGER,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "BookVoted_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "BookVoted_id_seq";

-- AlterTable
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "bookclub_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Invite_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Invite_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- CreateTable
CREATE TABLE "Cycle" (
    "id" TEXT NOT NULL,
    "bookclub_id" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "proposalEnd" TIMESTAMP(3),
    "votingEnd" TIMESTAMP(3),

    CONSTRAINT "Cycle_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookClub" ADD CONSTRAINT "BookClub_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BookClubMembers" ADD CONSTRAINT "BookClubMembers_bookclub_id_fkey" FOREIGN KEY ("bookclub_id") REFERENCES "BookClub"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BookClubMembers" ADD CONSTRAINT "BookClubMembers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BookVoted" ADD CONSTRAINT "BookVoted_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "BookProposed"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BookVoted" ADD CONSTRAINT "BookVoted_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BookVoted" ADD CONSTRAINT "BookVoted_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookVoted" ADD CONSTRAINT "BookVoted_bookClubId_fkey" FOREIGN KEY ("bookClubId") REFERENCES "BookClub"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookProposed" ADD CONSTRAINT "BookProposed_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BookProposed" ADD CONSTRAINT "BookProposed_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "Cycle"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BookProposed" ADD CONSTRAINT "BookProposed_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BookProposed" ADD CONSTRAINT "BookProposed_bookClubId_fkey" FOREIGN KEY ("bookClubId") REFERENCES "BookClub"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cycle" ADD CONSTRAINT "Cycle_bookclub_id_fkey" FOREIGN KEY ("bookclub_id") REFERENCES "BookClub"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BookSaved" ADD CONSTRAINT "BookSaved_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BookSaved" ADD CONSTRAINT "BookSaved_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_bookclub_id_fkey" FOREIGN KEY ("bookclub_id") REFERENCES "BookClub"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
