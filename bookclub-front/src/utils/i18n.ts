import i18n from "i18next";
import { initReactI18next } from "react-i18next";

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
};

void i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources,
        fallbackLng: 'en', // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
        // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
        // if you're using a language detector, do not define the lng option
        lng: localStorage.getItem('language') ?? 'en',
        debug: false,

        ns: ["common", "messages", "pages"],
        defaultNS: "common",
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    }
);

export default i18n;
