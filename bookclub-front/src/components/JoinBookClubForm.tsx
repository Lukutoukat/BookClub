import { useState } from 'react'
import { AxiosError } from 'axios'

import bookclubmembersService, { type AddBookClubMember } from '@/services/bookclubmembers'
import { SectionHeader } from './SectionHeader'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldLabel, FieldContent } from '@/components/ui/field'

const emptyJoinRequest: AddBookClubMember = {
	user_role: 1,
	invite_code: ''
}

type Props = {
	listMutated: () => void
}

const JoinBookClubForm = ({ listMutated }: Props) => {
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
			setMessage('Enter a 5-character code.')
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
					setMessage('Registration failed')
				}
			} else if (err instanceof AxiosError) {
				setMessage('Registration failed')
			} else {
				setMessage('Unexpected error occurred')
			}
		}
	}

	return (
		<Card className="card-base">
			<SectionHeader title="Join a book club" description="" />

			<CardContent className="card-content">
				<form onSubmit={handleJoinSubmit} className="card-form">
					<div className="form-grid">
						<div className="sm:col-span-2">
							<Field>
								<FieldLabel htmlFor="invite-code">Invite code</FieldLabel>
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
							You&apos;ll receive an invite code from your book club administrator.
						</p>
						<Button type="submit" size="lg" className="w-full sm:w-auto">
							Join
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	)
}

export default JoinBookClubForm
