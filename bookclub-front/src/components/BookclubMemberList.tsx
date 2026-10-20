import { useState, useEffect } from "react"
import { ButtonDialog } from "./ButtonDialog"
import memberService, { type BookclubMember } from "../services/bookclubmembers"
import { useNotification } from "@/context/NotificationContext"
import { getErrorMessage } from '@/lib/errorMessage.ts'
import { useTranslation } from "react-i18next"
import { ShieldUser } from 'lucide-react'

interface Props {
    bookclubId: string
    canManageMembers?: boolean
    className?: string
}

export const BookclubMemberList = ({ bookclubId, canManageMembers, className }: Props) => {
    const { t } = useTranslation()
    const [members, setMembers] = useState<BookclubMember[]>([])
    const { showSuccess, showError } = useNotification()

    useEffect(() => {
        void memberService.getByClubId(bookclubId)
            .then(memberData => {
                setMembers(memberData)
            })
            .catch(error => showError('Failed to load club members: ' + getErrorMessage(error)))
    }, [bookclubId])

    const handleMemberPromotion = async (user_id: string) => {
        try {
            await memberService.changeRole(bookclubId, user_id, 0)
            setMembers(prev => 
                prev.map(member => (member.user_id === user_id ? { ...member, user_role: 0 } : member))
            )
            showSuccess(t('success.promotedMember', { ns: 'messages' }))
        } catch {
            showError(t('error.api.promotedMember', { ns: 'messages' }))
        }
    }

    const handleMemberDeletion = async (user_id: string) => {
        try {
            await memberService.remove(bookclubId, user_id)
            setMembers(members.filter(member => member.user_id !== user_id))
            showSuccess(t('success.memberRemoved', { ns: 'messages' }))
        } catch (error) {
			showError('Failed to delete a member: ' + getErrorMessage(error))
        }
    }

    const sortMembers = members.toSorted((a, b) => a.user_role - b.user_role)

    return (
        <>
            {sortMembers.map((member) => (
                <div key={member.id} className={className}>
                    <div className="flex items-center gap-2">
                        {canManageMembers && member.user_role === 0 && (<ShieldUser 
                            aria-label="Admin" 
                            role="img" 
                            className='w-6 h-6 shrink-0'
                            />
                        )}
                        {member.User?.name}
                    </div>
                    {canManageMembers && member.user_role !== 0 && (
                        <div>
                            <ButtonDialog
                                buttonText={t('actions.promote')}
                                buttonOnClick={() => handleMemberPromotion(member.user_id)}
                                alertDialogText={t('club.settings.manageMembers.promoteQuestion', { name: member.User?.name, ns: 'pages' })}
                                alertDialogDescription={t('club.settings.manageMembers.promoteWarning', { ns: 'pages' })}
                                alertDialogContinueText={t('actions.promote')}
                                buttonVariant='dangerous'
                                buttonClassName="ml-2"
                            />
                            <ButtonDialog
                                buttonText={t('actions.remove')}
                                buttonOnClick={() => handleMemberDeletion(member.user_id)}
                                alertDialogText={t('club.settings.manageMembers.deleteQuestion', { name: member.User?.name, ns: 'pages' })}
                                alertDialogDescription={t('club.settings.manageMembers.deleteWarning', { ns: 'pages' })}
                                alertDialogContinueText={t('actions.remove')}
                                buttonVariant='destructive'
                                buttonClassName="ml-2"
                            />
                        </div>
                    )}
                </div>
            ))}
        </>
    )
}
