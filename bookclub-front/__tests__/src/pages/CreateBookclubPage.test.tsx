import { render, screen } from '@/utils/test-utils'
import { test, expect, describe } from 'vitest'
import CreateBookclubPage from '@/pages/CreateBookclubPage'

describe('CreateBookclubPage', () => {
	test('renders page header content', () => {
		render(<CreateBookclubPage />)

		expect(screen.getByText('New book club')).toBeDefined()
		expect(
			screen.getByText('Create a new book club for you and your friends to enjoy reading together.')
		).toBeDefined()
	})

	test('renders bookclub form', () => {
		render(<CreateBookclubPage />)

		expect(screen.getByRole('button', { name: 'Create' })).toBeDefined()

		expect(screen.getByLabelText('Name your book club')).toBeDefined()
	})
})
