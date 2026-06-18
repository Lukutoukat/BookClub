import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Card, CardContent } from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SectionHeader } from '@/components/SectionHeader'
import bookclubmembersService, { type AddBookClubMember } from '@/services/bookclubmembers'
import { AxiosError } from 'axios'

const emptyJoinRequest: AddBookClubMember = {
	invite_code: '',
	user_role: 1
}

const ClubSettings = () => {
	const [inviteCode, setInviteCode] = useState<AddBookClubMember>(emptyJoinRequest)
	const [message, setMessage] = useState<string | null>(null)

	const handleJoinSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (inviteCode.invite_code.trim().length !== 5) {
			setMessage('Enter a 5-character code.')
			return
		}
		try {
			await bookclubmembersService.create({
				invite_code: inviteCode.invite_code.trim().toUpperCase(),
				user_role: 1
			})
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
	const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = event.target

		setInviteCode((inviteCode) => ({
			...inviteCode,
			[name]: value
		}))
	}

	return (
		<Card className="border-border/60 bg-card/90 shadow-lg shadow-slate-950/5 backdrop-blur">
			<SectionHeader title="Clubs" description="Join or create your own book club." />

			<CardContent className="space-y-6 pt-4 sm:space-y-6 sm:pt-8">
				<div className="space-y-4">
					<Label htmlFor="join-code">Join with code</Label>
					<p className="text-sm text-muted-foreground">
						Enter the invite code you received from your club.
					</p>
					<form className="flex items-center gap-4" onSubmit={handleJoinSubmit}>
						<Input
							id="join-code"
							name="invite_code"
							maxLength={5}
							value={inviteCode.invite_code}
							onChange={handleChange}
							className="w-[9ch]"
						/>
						<Button type="submit">Join</Button>
					</form>
				</div>

				<div className="space-y-4">
					<Label>Create a new club</Label>
					<p className="text-sm text-muted-foreground">
						Set up a new club and invite others to join.
					</p>
					<Button asChild>
						<Link to="/create">Create</Link>
					</Button>
				</div>

				{message ? (
					<p className="rounded-3xl border border-primary/20 bg-primary/5 px-4 py-4 text-sm text-primary">
						{message}
					</p>
				) : null}
			</CardContent>
		</Card>
	)
}

export default ClubSettings
