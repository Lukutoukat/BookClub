import { useState, useEffect } from "react"
import { ButtonDialog } from "./ButtonDialog"
import memberService, { type BookclubMember } from "../services/bookclubmembers"
import { useNotification } from "@/context/NotificationContext"
import { useTranslation } from "react-i18next"

interface Props {
    bookclubId: string
    canManageMembers?: boolean
    className?: string
}

export const BookclubMemberList = ({ bookclubId, canManageMembers, className }: Props) => {
    const { t } = useTranslation()
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
            showSuccess(t('success.memberRemoved', { ns: 'messages' }))
        } catch (error) {
            // TODO: handle error messaging through Notification system
            console.error('Failed to delete member: ', error)
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
                            buttonText={t('actions.remove')}
                            buttonOnClick={() => handleMemberDeletion(member.user_id)}
                            alertDialogText={t('club.members.deleteQuestion', { name: member.User?.name, ns: 'pages' })}
                            alertDialogDescription={t('club.members.deleteWarning', { ns: 'pages' })}
                            alertDialogContinueText={t('actions.remove')}
                            buttonVariant="destructive"
                        />
                    )}
                </div>
            ))}
        </>
    )
}
