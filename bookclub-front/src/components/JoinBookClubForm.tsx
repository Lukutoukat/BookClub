import { useState } from 'react'
import { AxiosError } from 'axios'

import bookclubmembersService, { type AddBookClubMember } from '@/services/bookclubmembers'
import { SectionHeader } from './SectionHeader'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldLabel, FieldContent } from '@/components/ui/field'

import { useTranslation } from 'react-i18next'

const emptyJoinRequest: AddBookClubMember = {
	user_role: 1,
	invite_code: ''
}

type Props = {
	listMutated: () => void
}

const JoinBookClubForm = ({ listMutated }: Props) => {
	const { t } = useTranslation('pages')
	const [inviteCode, setInviteCode] = useState<AddBookClubMember>(emptyJoinRequest)
	const [message, setMessage] = useState<string | null>(null)

	const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = event.target

		setInviteCode((inviteCode) => ({
			...inviteCode,
			[name]: value
		}))
	}

	const handleJoinSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
		event.preventDefault()

		const trimmedCode = inviteCode.invite_code.trim()

		if (trimmedCode.length !== 5) {
			setMessage(t('error.validation.invalidInviteCode', { ns: 'messages' }))
			return
		}

		try {
			await bookclubmembersService.create({
				user_role: 1,
				invite_code: trimmedCode.toUpperCase()
			})
			setInviteCode({ ...emptyJoinRequest })
			listMutated()
		} catch (err: unknown) {
			if (err instanceof AxiosError && err.response?.data) {
				const errorData = err.response.data as Record<string, unknown>
				if (errorData.error && typeof errorData.error === 'string') {
					setMessage(errorData.error)
				} else {
					setMessage(t('error.api.registrationFailed', { ns: 'messages' }))
				}
			} else if (err instanceof AxiosError) {
				setMessage(t('error.api.registrationFailed', { ns: 'messages' }))
			} else {
				setMessage(t('error.generic.unexpected', { ns: 'messages' }))
			}
		}
	}

	return (
		<Card className="card-base">
			<SectionHeader title={t('home.joinClub.title')} description="" />

			<CardContent className="card-content">
				<form onSubmit={handleJoinSubmit} className="card-form">
					<div className="form-grid">
						<div className="sm:col-span-2">
							<Field>
								<FieldLabel htmlFor="invite-code">{t('home.joinClub.inviteCode')}</FieldLabel>
								<FieldContent>
									<Input
										id="invite-code"
										name="invite_code"
										maxLength={5}
										value={inviteCode.invite_code}
										onChange={handleChange}
										placeholder="XXXXX"
										required
									/>
								</FieldContent>
							</Field>
						</div>
					</div>

					{message && <div className="form-note">{message}</div>}

					<div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between sm:pt-4">
						<p className="max-w-md text-xs text-muted-foreground">
							{t('home.joinClub.hint')}
						</p>
						<Button type="submit" size="lg" className="w-full sm:w-auto">
							{t('actions.join', { ns: 'common' })}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	)
}

export default JoinBookClubForm
