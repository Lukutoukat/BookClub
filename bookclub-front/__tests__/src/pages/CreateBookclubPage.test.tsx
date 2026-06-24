import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { test, expect, describe } from 'vitest'
import CreateBookclubPage from '@/pages/CreateBookclubPage'

const renderWithRouter = (component: React.ReactElement) => {
	return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('CreateBookclubPage', () => {
	test('renders page header content', () => {
		renderWithRouter(<CreateBookclubPage />)

		expect(screen.getByText('New book club')).toBeDefined()
		expect(
			screen.getByText('Create a new book club for you and your friends to enjoy reading together.')
		).toBeDefined()
	})

	test('renders bookclub form', () => {
		renderWithRouter(<CreateBookclubPage />)

		expect(screen.getByRole('button', { name: 'Create' })).toBeDefined()

		expect(screen.getByLabelText('Name your book club')).toBeDefined()
	})
})
