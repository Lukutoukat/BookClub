import { PageHeader } from '@/components/PageHeader'
import { useLogin } from '@/hooks/useLogin'
import ClubSettings from '@/components/ClubSettings'
import AccountSettings from '@/components/AccountSettings'
import ThemeSelector from '@/components/ThemeSelector'
import LanguageSelector from '@/components/LanguageSelector'
import { Column } from '@/components/Column'
import { useTranslation } from 'react-i18next'

const SettingsPage = () => {
	const { logout } = useLogin()
	const { t } = useTranslation()

	return (
		<>
			<PageHeader
				badgeText={t('labels.settings')}
				title={t('settings.title', { ns: 'pages' })}
				description={t('settings.description', { ns: 'pages' })}
			/>
			<Column>
				<ClubSettings />

				<AccountSettings handleLogOut={logout} />

				<ThemeSelector />

				<LanguageSelector />
			</Column>
		</>
	)
}

export default SettingsPage
