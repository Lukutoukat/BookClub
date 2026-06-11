-- DropForeignKey
ALTER TABLE "BookClubMembers" DROP CONSTRAINT "BookClubMembers_bookclub_id_fkey";

-- DropForeignKey
ALTER TABLE "BookProposed" DROP CONSTRAINT "BookProposed_cycle_id_fkey";

-- DropForeignKey
ALTER TABLE "BookVoted" DROP CONSTRAINT "BookVoted_proposal_id_fkey";

-- DropForeignKey
ALTER TABLE "Cycle" DROP CONSTRAINT "Cycle_bookclub_id_fkey";

-- DropForeignKey
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_bookclub_id_fkey";

-- AddForeignKey
ALTER TABLE "BookClubMembers" ADD CONSTRAINT "BookClubMembers_bookclub_id_fkey" FOREIGN KEY ("bookclub_id") REFERENCES "BookClub"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BookVoted" ADD CONSTRAINT "BookVoted_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "BookProposed"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BookProposed" ADD CONSTRAINT "BookProposed_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "Cycle"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Cycle" ADD CONSTRAINT "Cycle_bookclub_id_fkey" FOREIGN KEY ("bookclub_id") REFERENCES "BookClub"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_bookclub_id_fkey" FOREIGN KEY ("bookclub_id") REFERENCES "BookClub"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
