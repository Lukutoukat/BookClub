import { useState } from 'react'
import { AxiosError } from 'axios'
import userService, { type CreateUser } from '@/services/users'
import { SectionHeader } from './SectionHeader'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldLabel, FieldContent } from '@/components/ui/field'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '@/context/NotificationContext'
import { useTranslation } from 'react-i18next'

const emptyUser: CreateUser = {
	email: '',
	name: '',
	password: ''
}

const RegistrationForm = () => {
	const { t } = useTranslation('pages')
	const [newUser, setNewUser] = useState<CreateUser>(emptyUser)
	const [confirmPassword, setConfirmPassword] = useState('')
	const [message, setMessage] = useState<string | null>(null)
	const navigate = useNavigate()
	const { showSuccess } = useNotification()

	const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = event.target

		setNewUser((currentUser) => ({
			...currentUser,
			[name]: value
		}))
	}

	const handleConfirmPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setConfirmPassword(event.target.value)
	}

	const isValidPassword = (password: string) => {
		return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)
	}

	const addUser = async (event: React.SyntheticEvent<HTMLFormElement>) => {
		event.preventDefault()

		if (newUser.password !== confirmPassword) {
			setMessage(t('error.validation.passwordMismatch', { ns: 'messages' }))
			return
		}

		if (!isValidPassword(newUser.password)) {
			alert(
				t('user.passwordHint')
			)
			return
		}

		try {
			await userService.create(newUser)
			setNewUser(emptyUser)
			setConfirmPassword('')
			showSuccess(t('success.register', { ns: 'messages' }))
			await navigate('/login')
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
			<SectionHeader
				title={t('user.registerTitle')}
				description={t('user.registerDescription')}
			/>

			<CardContent className="card-content">
				<form onSubmit={addUser} className="card-form">
					<div className="form-grid">
						<div className="sm:col-span-2">
							<Field>
								<FieldLabel htmlFor="email">{t('user.emailAddress')}</FieldLabel>
								<FieldContent>
									<Input
										id="email"
										name="email"
										type="email"
										value={newUser.email}
										onChange={handleChange}
										autoComplete="email"
										placeholder="you@example.com"
										required
									/>
								</FieldContent>
							</Field>
						</div>

						<div className="sm:col-span-2">
							<Field>
								<FieldLabel htmlFor="name">{t('user.username')}</FieldLabel>
								<FieldContent>
									<Input
										id="name"
										name="name"
										value={newUser.name}
										onChange={handleChange}
										autoComplete="name"
										placeholder={t('user.username')}
										required
									/>
								</FieldContent>
							</Field>
						</div>

						<Field>
							<FieldLabel htmlFor="password">{t('user.password')}</FieldLabel>
							<FieldContent>
								<Input
									id="password"
									type="password"
									name="password"
									value={newUser.password}
									onChange={handleChange}
									autoComplete="new-password"
									placeholder={t('placeholder.account.password', { ns: 'common' })}
									required
									minLength={8}
									pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$"
									title={t('user.passwordHint')}
								/>
							</FieldContent>
						</Field>

						<Field>
							<FieldLabel htmlFor="confirmPassword">{t('user.confirmPassword')}</FieldLabel>
							<FieldContent>
								<Input
									id="confirmPassword"
									type="password"
									name="confirmPassword"
									value={confirmPassword}
									onChange={handleConfirmPasswordChange}
									autoComplete="new-password"
									placeholder={t('placeholder.account.confirmPassword', { ns: 'common' })}
									required
								/>
							</FieldContent>
						</Field>
					</div>
					{message && (
						<div className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded text-primary text-sm">
							{message}
						</div>
					)}

					<div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between sm:pt-4">
						<p className="max-w-md text-xs text-muted-foreground">
							{t('user.registerHint')}
						</p>
						<Button type="submit" size="lg" className="button-full-sm-auto">
							{t('user.registerButton')}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	)
}

export default RegistrationForm
