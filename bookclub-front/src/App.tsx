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
import { useEffect, useState } from 'react'
import loginService, { type LoggedInUser } from './services/login'
import ClubSettingsPage from './pages/BookClubSettingsPage'
import { NotificationProvider } from './context/NotificationContext'
import { BottomDescription } from './components/BottomDescription'
import {AppProvider} from "@/context/AppContext.tsx";


const App = () => {
	const [loginValid, setLoginValid] = useState(true)
	const [user, setUser] = useState<LoggedInUser | undefined>(undefined);

	useEffect(
		() =>
			void (async function () {
				try {
					const self = await loginService.getSelf();
					setLoginValid(self !== undefined)
					setUser(self)
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
						<AppProvider user={user}>
							<NotificationProvider>
								<Routes>
									<Route path="/login" element={<LoginPage />} />
									<Route path="/registration" element={<RegistrationPage />} />
									<Route path="/" element={<Navigate to="/login" replace />} />
									<Route path="*" element={<Navigate to="/login" replace />} />
									<Route path="/passwordreset" element={<PasswordResetPage />} />
								</Routes>
								<BottomDescription />
							</NotificationProvider>
						</AppProvider>
					</PageLayout>
				</main>
			</BrowserRouter>
		)
	}

	return (
		<BrowserRouter>
			<PageMenu>
				<PageLayout>
					<AppProvider user={user}>
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
					</AppProvider>
				</PageLayout>
			</PageMenu>
		</BrowserRouter>
	)
}

export default App
