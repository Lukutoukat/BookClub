// test/setup.ts
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { ReactNode } from 'react'
import './testI18n'

window.HTMLElement.prototype.hasPointerCapture = vi.fn()
window.HTMLElement.prototype.setPointerCapture = vi.fn()
window.HTMLElement.prototype.releasePointerCapture = vi.fn()
window.HTMLElement.prototype.scrollIntoView = vi.fn()

const { mockUseParams } = vi.hoisted(() => ({
	mockUseParams: vi.fn()
}))

vi.mock('react-router-dom', async (importOriginal) => {
	const actual = await importOriginal<typeof import('react-router-dom')>()
	return {
		...actual,
		useParams: vi.fn(() => ({})),
		useNavigate: () => vi.fn()
	}
})

vi.mock('@/context/NotificationContext', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@/context/NotificationContext')>()
	const noop = vi.fn()
	return {
		...actual,
		useNotification: () => {
			try {
				return actual.useNotification()
			} catch {
				return { showSuccess: noop, showError: noop }
			}
		}
	}
})

Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
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

Object.defineProperty(Element.prototype, 'scrollIntoView', {
	value: vi.fn(),
	writable: true
})

const localStorageMock = (() => {
	let store: Record<string, string> = {}
	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value.toString()
		},
		removeItem: (key: string) => {
			delete store[key]
		},
		clear: () => {
			store = {}
		},
		get length() {
			return Object.keys(store).length
		},
		key: (i: number) => Object.keys(store)[i] || null
	}
})()

Object.defineProperty(globalThis, 'localStorage', {
	value: localStorageMock,
	writable: true
})
if (typeof window !== 'undefined') {
	Object.defineProperty(window, 'localStorage', {
		value: localStorageMock,
		writable: true
	})
}

afterEach(() => {
	cleanup()
	vi.clearAllMocks()
})

class ResizeObserver {
	observe = vi.fn()
	unobserve = vi.fn()
	disconnect = vi.fn()
}

Object.defineProperty(globalThis, 'ResizeObserver', {
	value: ResizeObserver,
	writable: true
})
