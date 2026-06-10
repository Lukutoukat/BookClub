import { Badge } from '@/components/ui/badge'

export const UserLoginDisplay = () => {
    try {
        const userJson = localStorage.getItem('loggedBookappUser')
        const user = JSON.parse(userJson!)
        console.log("NIMI",user.name)
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
