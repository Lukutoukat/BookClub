import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import axios from 'axios'
import BooksPage from './pages/BooksPage'
import RegistrationPage from './pages/RegistrationPage'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import CreateBookclubPage from './pages/CreateBookclubPage'
import SettingsPage from './pages/SettingsPage'
import BookclubPage from './pages/BookclubPage'
import PasswordResetPage from './pages/PasswordResetPage'
import NewCyclePage from './pages/NewCyclePage'
import { PageMenu } from './components/PageMenu'
import { PageLayout } from './components/PageLayout'
import { isLoggedIn } from './services/auth'
import { useEffect, useState } from 'react'
import userService from './services/users'
import ClubSettingsPage from './pages/BookClubSettingsPage'
import { NotificationProvider } from './context/NotificationContext'
import { BottomDescription } from './components/BottomDescription'

//useEffect!!! :)

const App = () => {
	const [loginValid, setLoginValid] = useState(true)

	useEffect(
		() =>
			void (async function () {
				try {
					const userExists = await userService.getAll()
					if (userExists.length > 0 && isLoggedIn()) {
						setLoginValid(true)
					}
					if (userExists.length === 0) {
						setLoginValid(false)
					}
				} catch (error) {
					if (axios.isAxiosError(error) && error.response?.status === 401) {
						setLoginValid(false)
					}
				}
			})(),
		[]
	)

	if (!loginValid) {
		return (
			<BrowserRouter>
				<main>
					<PageLayout>
						<Routes>
							<Route path="/login" element={<LoginPage />} />
							<Route path="/registration" element={<RegistrationPage />} />
							<Route path="/" element={<Navigate to="/login" replace />} />
							<Route path="*" element={<Navigate to="/login" replace />} />
							<Route path="/passwordreset" element={<PasswordResetPage />} />
						</Routes>
						<BottomDescription />
					</PageLayout>
				</main>
			</BrowserRouter>
		)
	}

	return (
		<BrowserRouter>
			<PageMenu>
				<PageLayout>
					<NotificationProvider>
						<Routes>
							<Route path="/" element={<Navigate to="/home" replace />} />
							<Route path="/books" element={<BooksPage />} />
							<Route path="/create" element={<CreateBookclubPage />} />
							<Route path="/registration" element={<RegistrationPage />} />
							<Route path="/club/:bookclubId" element={<BookclubPage />} />
							<Route path="/newcycle/:bookclubId" element={<NewCyclePage />} />
							<Route path="/home" element={<HomePage />} />
							<Route path="/settings" element={<SettingsPage />} />
							<Route path="*" element={<Navigate to="/home" replace />} />
							<Route path="bookclubsettings/:bookclubId" element={<ClubSettingsPage />} />
						</Routes>
						<BottomDescription />
					</NotificationProvider>
				</PageLayout>
			</PageMenu>
		</BrowserRouter>
	)
}

export default App
