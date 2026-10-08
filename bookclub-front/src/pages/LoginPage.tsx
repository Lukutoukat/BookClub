import { useState } from 'react'

import LoginForm from '@/components/LoginForm'
import { useLogin } from '@/hooks/useLogin'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/PageHeader'
import { Column } from '@/components/Column'
import { useTranslation } from 'react-i18next'

const LoginPage = () => {
	const { t } = useTranslation()
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const { login, message } = useLogin()

	const handleLogin = async (event: React.SyntheticEvent<HTMLFormElement>) => {
		event.preventDefault()

		await login(username, password)
		setUsername('')
		setPassword('')
	}

	return (
		<>
			<PageHeader
				badgeText={t('labels.login')}
				title={t('user.title', { ns: 'pages' })}
				description={t('user.description', { ns: 'pages' })}
				buttonText={t('actions.registerTab')}
				buttonLink="/registration"
			/>
			<Column>
				<Card className="card-base">
					<CardHeader className="card-header">
						<CardTitle className="text-xl sm:text-2xl">{t('user.loginTitle', { ns: 'pages' })}</CardTitle>

						<CardDescription className="text-sm sm:text-base">{t('user.loginDescription', { ns: 'pages' })}</CardDescription>
					</CardHeader>

					<CardContent className="pt-4 sm:pt-6">
						<LoginForm
							username={username}
							password={password}
							setUsername={setUsername}
							setPassword={setPassword}
							handleLogin={handleLogin}
							message={message}
						/>
					</CardContent>
				</Card>
			</Column>
		</>
	)
}

export default LoginPage
