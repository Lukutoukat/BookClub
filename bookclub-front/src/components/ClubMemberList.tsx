import { useState, useEffect } from "react"
import { ButtonDialog } from "./ButtonDialog"
import memberService, { type BookclubMember } from "../services/bookclubmembers"

interface Props {
    bookclubId: string
}

export const ClubMemberList = ({ bookclubId }: Props) => {
    const [members, setMembers] = useState<BookclubMember[]>([])

    useEffect(() => {
        void memberService.getByClubId(bookclubId)
            .then(memberData => {
                setMembers(memberData)
            })
    }, [bookclubId])

    const handleMemberDeletion = async (user_id: string) => {
        try {
            await memberService.remove(bookclubId, user_id)
            setMembers(members.filter(member => member.user_id !== user_id))
        } catch (error) {
            // TODO: handle error messaging through Notification system
            console.error('error during deletion', error)
        }
    }

    return (
        <>
            {members.map((member) => (
                <div key={member.id} className='flex flex-row flex-wrap items-center justify-between border-b-1 min-h-[50px]'>
                    <div>
                        {member.User?.name}
                    </div>
                    {member.user_role !== 0 && (
                        <ButtonDialog
                            buttonText="Remove"
                            buttonOnClick={() => handleMemberDeletion(member.user_id)}
                            alertDialogText={`Are you sure you want to remove ${member.User?.name} from the club?`}
                            alertDialogDescription="Once the member is removed, it cannot be undone."
                            alertDialogContinueText="Remove"
                            buttonVariant="destructive"
                        />
                    )}
                </div>
            ))}
        </>
    )
}
