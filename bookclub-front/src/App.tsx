import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import BooksPage from './pages/BooksPage'
import RegistrationPage from './pages/RegistrationPage'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import CreateBookclubPage from './pages/CreateBookclubPage'
import SettingsPage from './pages/SettingsPage'
import { PageMenu } from './components/PageMenu'
import { isLoggedIn } from './services/auth'

const App = () => {
  if (!isLoggedIn()) {
    return(
      <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registration" element={<RegistrationPage />} />
          </Routes>
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <PageMenu>
        <Routes>
          <Route path="/" element={<Navigate to="/registration" replace />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/create" element={<CreateBookclubPage />} />
          <Route path="/registration" element={<RegistrationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/settings" element={<SettingsPage />}/>
        </Routes>
      </PageMenu>
    </BrowserRouter>
  )
}

export default App
