import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enCommon from './src/locales/en/common.json'
import enMessages from './src/locales/en/messages.json'
import enPages from './src/locales/en/pages.json'

const resources = {
  en: { common: enCommon, messages: enMessages, pages: enPages }
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
