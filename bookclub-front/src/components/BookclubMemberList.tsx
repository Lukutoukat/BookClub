import { useState, useEffect } from "react"
import { ButtonDialog } from "./ButtonDialog"
import memberService, { type BookclubMember } from "../services/bookclubmembers"
import { useNotification } from "@/context/NotificationContext"

interface Props {
    bookclubId: string
    canManageMembers?: boolean
    className?: string
}

export const BookclubMemberList = ({ bookclubId, canManageMembers, className }: Props) => {
    const [members, setMembers] = useState<BookclubMember[]>([])
    const { showSuccess } = useNotification()

    useEffect(() => {
        void memberService.getByClubId(bookclubId)
            .then(memberData => {
                setMembers(memberData)
            })
            .catch(error => console.error('failed to load members', error))
    }, [bookclubId])

    const handleMemberDeletion = async (user_id: string) => {
        try {
            await memberService.remove(bookclubId, user_id)
            setMembers(members.filter(member => member.user_id !== user_id))
            showSuccess('Club member removed successfully.')
        } catch (error) {
            // TODO: handle error messaging through Notification system
            console.error('error during deletion', error)
        }
    }

    return (
        <>
            {members.map((member) => (
                <div key={member.id} className={className}>
                    <div>
                        {member.User?.name}
                    </div>
                    {canManageMembers && member.user_role !== 0 && (
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
