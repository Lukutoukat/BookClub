import { Badge } from '@/components/ui/badge'
import { useContext } from 'react'
import { AppContext } from '@/context/AppContext.tsx'
import { useTranslation } from 'react-i18next'

export const UserLoginDisplay = () => {
	const { t } = useTranslation()
	const { user } = useContext(AppContext);

	if (!user) return null;

	try {
		return (
			<Badge
				variant="secondary"
				className="ml-auto w-fit uppercase tracking-[0.2em] text-[0.7rem] sm:text-xs"
			>
			{t('labels.loggedInAs', { name: user.name })}
			</Badge>
		)
	} catch {
		return null
	}
}
