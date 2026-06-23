import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { applyThemeToDOM, getInitialTheme, saveTheme, type Theme } from '@/lib/theme'

describe('theme util', () => {
	const originalMatchMedia = window.matchMedia

	beforeEach(() => {
		localStorage.clear()
		Object.defineProperty(window, 'matchMedia', {
			writable: true,
			value: vi.fn().mockImplementation((query: string) => ({
				matches: false,
				media: query,
				onchange: null,
				addListener: vi.fn(),
				removeListener: vi.fn(),
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				dispatchEvent: vi.fn()
			}))
		})
		document.documentElement.className = ''
	})

	afterEach(() => {
		vi.restoreAllMocks()
		Object.defineProperty(window, 'matchMedia', {
			writable: true,
			value: originalMatchMedia
		})
	})

	it('returns localStorage theme when saved theme is light', () => {
		localStorage.setItem('theme', 'light')

		expect(getInitialTheme()).toBe('light')
	})

	it('returns localStorage theme when saved theme is dark', () => {
		localStorage.setItem('theme', 'dark')

		expect(getInitialTheme()).toBe('dark')
	})

	it('falls back to system preference when saved theme is invalid', () => {
		localStorage.setItem('theme', 'blue')
		vi.mocked(window.matchMedia).mockReturnValueOnce({
			matches: true,
			media: '(prefers-color-scheme: dark)',
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn()
		})

		expect(getInitialTheme()).toBe('dark')
	})

	it('falls back to light when no saved theme and system preference is light', () => {
		expect(getInitialTheme()).toBe('light')
	})

	it('applies dark theme to the DOM', () => {
		applyThemeToDOM('dark')
		expect(document.documentElement.classList.contains('dark')).toBe(true)
	})

	it('removes dark theme from the DOM when light is applied', () => {
		document.documentElement.classList.add('dark')
		applyThemeToDOM('light')
		expect(document.documentElement.classList.contains('dark')).toBe(false)
	})

	it('saves theme to localStorage', () => {
		saveTheme('dark')
		expect(localStorage.getItem('theme')).toBe('dark')
	})
})
