import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enCommon from '@/locales/en/common.json'
import enMessages from '@/locales/en/messages.json'
import enPages from '@/locales/en/pages.json'

import fiCommon from '@/locales/fi/common.json'
import fiMessages from '@/locales/fi/messages.json'
import fiPages from '@/locales/fi/pages.json'

import svCommon from '@/locales/sv/common.json'
import svMessages from '@/locales/sv/messages.json'
import svPages from '@/locales/sv/pages.json'

const resources = {
  en: { common: enCommon, messages: enMessages, pages: enPages },
  fi: { common: fiCommon, messages: fiMessages, pages: fiPages },
  sv: { common: svCommon, messages: svMessages, pages: svPages },
}

void i18n
	.use(initReactI18next)
	.init({
		resources,
		fallbackLng: 'en',
		lng: 'en',
		ns: ["common", "messages", "pages"],
		debug: true
	}
)

export default i18n
