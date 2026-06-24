import { Badge } from '@/components/ui/badge'

interface LoggedUser {
	name?: string
}

export const UserLoginDisplay = () => {
	const userJson = localStorage.getItem('loggedBookappUser')
	if (!userJson) return null

	try {
		const user = JSON.parse(userJson) as LoggedUser
		if (!user?.name) return null

		return (
			<Badge
				variant="secondary"
				className="ml-auto w-fit uppercase tracking-[0.2em] text-[0.7rem] sm:text-xs"
			>
				Logged in as: {user.name}
			</Badge>
		)
	} catch {
		return null
	}
}
