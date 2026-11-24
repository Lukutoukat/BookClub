import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enCommon from '@/locales/en/common.json'
import enMessages from '@/locales/en/messages.json'
import enPages from '@/locales/en/pages.json'
import enClubSettings from '@/locales/en/clubSettings.json'

import fiCommon from '@/locales/fi/common.json'
import fiMessages from '@/locales/fi/messages.json'
import fiPages from '@/locales/fi/pages.json'
import fiClubSettings from '@/locales/fi/clubSettings.json'

import svCommon from '@/locales/sv/common.json'
import svMessages from '@/locales/sv/messages.json'
import svPages from '@/locales/sv/pages.json'
import svClubSettings from '@/locales/sv/clubSettings.json'

const resources = {
  en: { common: enCommon, messages: enMessages, pages: enPages, clubSettings: enClubSettings },
  fi: { common: fiCommon, messages: fiMessages, pages: fiPages, clubSettings: fiClubSettings },
  sv: { common: svCommon, messages: svMessages, pages: svPages, clubSettings: svClubSettings }
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    ns: ['common', 'messages', 'pages', 'clubSettings'],
    defaultNS: 'common',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'language',
      caches: []
    },
    interpolation: { escapeValue: false }
  })

export default i18n
