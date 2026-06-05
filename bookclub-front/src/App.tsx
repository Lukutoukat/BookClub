import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

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

const App = () => {
  if (!isLoggedIn()) {
    return(
      <BrowserRouter>
        <main>
          <PageLayout>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/registration" element={<RegistrationPage />} />
              <Route path="/passwordreset" element={<PasswordResetPage />} />
            </Routes>
          </PageLayout>
        </main>
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <PageMenu>
        <PageLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/registration" replace />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/create" element={<CreateBookclubPage />} />
            <Route path="/registration" element={<RegistrationPage />} />
            <Route path="/club/:bookclubId" element={<BookclubPage />} />
            <Route path="/newcycle/:bookclubId" element={<NewCyclePage />} /> 
            <Route path="/home" element={<HomePage />} />
            <Route path="/settings" element={<SettingsPage />}/>
          </Routes>
        </PageLayout>
      </PageMenu>
    </BrowserRouter>
  )
}

export default App
