import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import BooksPage from './pages/BooksPage'
import RegistrationPage from './pages/RegistrationPage'
import HomePage from './pages/HomePage'
import CreateBookclubPage from './pages/CreateBookclubPage'
import SettingsPage from './pages/SettingsPage'
import BookclubPage from './pages/BookclubPage'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/registration" replace />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="/create" element={<CreateBookclubPage />} />
        <Route path="/registration" element={<RegistrationPage />} />
        <Route path="/club/:bookclubId" element={<BookclubPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/settings" element={<SettingsPage />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
