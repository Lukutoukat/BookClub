import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import BooksPage from './pages/BooksPage'
import RegistrationPage from './pages/RegistrationPage'
import { PageMenu } from './components/PageMenu'

const App = () => {
  return (
    <BrowserRouter>
      <PageMenu>
        <Routes>
          <Route path="/" element={<Navigate to="/registration" replace />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/registration" element={<RegistrationPage />} />
        </Routes>
      </PageMenu>
    </BrowserRouter>
  )
}

export default App
