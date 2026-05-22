import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import BooksPage from './pages/BooksPage'
import RegistrationPage from './pages/RegistrationPage'
import LoginPage from './pages/LoginPage'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="/registration" element={<RegistrationPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
