import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@/utils/test-utils'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import LanguageSelector from '@/components/LanguageSelector'


describe('LanguageSelector', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        localStorage.clear()
    })

    it('renders language selector component', () => {
        render(<LanguageSelector />)

        expect(screen.getByText('Language')).toBeInTheDocument()
        expect(screen.getByText('Change website language')).toBeInTheDocument()
        expect(screen.getByText('English')).toBeInTheDocument()
    })

    it('shows available languages on dropdown', async () => {
        const user = userEvent.setup() 
        render(<LanguageSelector />)

        await user.click(screen.getByRole('combobox'))

		const options = await screen.findByRole('listbox')
		expect(within(options).getByRole('option', { name: 'English' })).toBeInTheDocument()
		expect(within(options).getByRole('option', { name: 'Suomi' })).toBeInTheDocument()
		expect(within(options).getByRole('option', { name: 'Svenska' })).toBeInTheDocument()
    })

    it('changes website language when selected', async () => {
        const user = userEvent.setup()
        render(<LanguageSelector />)

        expect(screen.getByRole('combobox')).toHaveTextContent('English')

        await user.click(screen.getByRole('combobox'))
        await user.click(await screen.getByRole('option', { name: 'Suomi' }))

        expect(localStorage.getItem('language')).toBe('fi')
        expect(screen.getByRole('combobox')).toHaveTextContent('Suomi')

        await user.click(screen.getByRole('combobox'))
        await user.click(await screen.getByRole('option', { name: 'Svenska' }))        

        expect(localStorage.getItem('language')).toBe('sv')
        expect(screen.getByRole('combobox')).toHaveTextContent('Svenska')
    })
})
