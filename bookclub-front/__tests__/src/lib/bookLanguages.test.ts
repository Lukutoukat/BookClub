import {test, expect, vi, describe, beforeEach} from 'vitest'
import {
    LANGUAGES,
    getLanguageCodes,
    getLanguages,
    getLanguageLabel,
    isLanguageCode,
    type LanguageCode,
} from '@/lib/bookLanguages'

vi.mock('i18next', () => ({
    default: {t: vi.fn((key: string) => `t:${key}`)},
}))

import i18n from 'i18next'

const mockedT = vi.mocked(i18n.t)

describe('bookLanguages', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('LANGUAGES', () => {
        test('contains expected codes', () => {
            expect(LANGUAGES.fin).toBe('languages.fin')
            expect(LANGUAGES.eng).toBe('languages.eng')
            expect(LANGUAGES.swe).toBe('languages.swe')
        })

        test('every value is a languages.* translation key', () => {
            Object.values(LANGUAGES).forEach((v) => {
                expect(v).toMatch(/^languages\.[a-z]+$/)
            })
        })
    })

    describe('getLanguageCodes', () => {
        test('returns all keys of LANGUAGES', () => {
            const codes = getLanguageCodes()
            expect(codes).toEqual(Object.keys(LANGUAGES))
        })

        test('contains every known code', () => {
            const codes = getLanguageCodes()
            expect(codes).toContain('fin')
            expect(codes).toContain('eng')
            expect(codes).toContain('kur')
        })
    })

    describe('getLanguages', () => {
        test('returns { code, label } pairs for every code', () => {
            const result = getLanguages()
            expect(result).toHaveLength(Object.keys(LANGUAGES).length)
            expect(result[0]).toEqual({code: 'fin', label: 't:languages.fin'})
        })

        test('uses getLanguageLabel for each label', () => {
            getLanguages()
            expect(mockedT).toHaveBeenCalledTimes(Object.keys(LANGUAGES).length)
            expect(mockedT).toHaveBeenCalledWith('languages.fin', {ns: 'common'})
        })
    })

    describe('getLanguageLabel', () => {
        test('delegates to i18n.t with the languages.* key and common namespace', () => {
            const label = getLanguageLabel('eng')
            expect(label).toBe('t:languages.eng')
            expect(mockedT).toHaveBeenCalledWith('languages.eng', {ns: 'common'})
        })

        test('works for every code', () => {
            for (const code of getLanguageCodes()) {
                expect(getLanguageLabel(code)).toBe(`t:${LANGUAGES[code]}`)
            }
        })
    })

    describe('isLanguageCode', () => {
        test('returns true for every known code', () => {
            for (const code of getLanguageCodes()) {
                expect(isLanguageCode(code)).toBe(true)
            }
        })

        test('returns false for unknown codes', () => {
            expect(isLanguageCode('xxx')).toBe(false)
            expect(isLanguageCode('FIN')).toBe(false)
            expect(isLanguageCode('')).toBe(false)
        })

        test('returns false for prototype keys', () => {
            expect(isLanguageCode('toString')).toBe(false)
            expect(isLanguageCode('hasOwnProperty')).toBe(false)
            expect(isLanguageCode('__proto__')).toBe(false)
        })

        test('narrows the type', () => {
            const value: string = 'eng'
            if (isLanguageCode(value)) {
                const narrowed: LanguageCode = value
                expect(narrowed).toBe('eng')
            }
        })
    })
})