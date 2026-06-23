import { PageHeader } from '@/components/PageHeader'
import { useLogin } from '@/hooks/useLogin'
import ClubSettings from '@/components/ClubSettings'
import AccountSettings from '@/components/AccountSettings'
import ThemeSelector from '@/components/ThemeSelector'
import { Column } from '@/components/Column'

const SettingsPage = () => {
	const { logout } = useLogin()

	return (
		<>
			<PageHeader
				badgeText="Settings"
				title="Settings"
				description="Change your settings or create or join a book club."
			/>
			<Column>
				<ClubSettings />

				<AccountSettings handleLogOut={logout} />

				<ThemeSelector />
			</Column>
		</>
	)
}

export default SettingsPage
