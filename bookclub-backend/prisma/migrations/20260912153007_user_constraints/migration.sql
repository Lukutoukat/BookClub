-- DropForeignKey
ALTER TABLE "BookClub" DROP CONSTRAINT "BookClub_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "BookClubMembers" DROP CONSTRAINT "BookClubMembers_user_id_fkey";

-- DropForeignKey
ALTER TABLE "BookProposed" DROP CONSTRAINT "BookProposed_user_id_fkey";

-- DropForeignKey
ALTER TABLE "BookSaved" DROP CONSTRAINT "BookSaved_user_id_fkey";

-- DropForeignKey
ALTER TABLE "BookVoted" DROP CONSTRAINT "BookVoted_user_id_fkey";

-- AddForeignKey
ALTER TABLE "BookClub" ADD CONSTRAINT "BookClub_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BookClubMembers" ADD CONSTRAINT "BookClubMembers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BookVoted" ADD CONSTRAINT "BookVoted_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BookProposed" ADD CONSTRAINT "BookProposed_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BookSaved" ADD CONSTRAINT "BookSaved_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
