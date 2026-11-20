import enCommon from '../bookclub-front/src/locales/en/common.json'
import enMessages from '../bookclub-front/src/locales/en/messages.json'
import enPages from '../bookclub-front/src/locales/en/pages.json'

import fiCommon from '../bookclub-front/src/locales/fi/common.json'
import fiMessages from '../bookclub-front/src/locales/fi/messages.json'
import fiPages from '../bookclub-front/src/locales/fi/pages.json'

import svCommon from '../bookclub-front/src/locales/sv/common.json'
import svMessages from '../bookclub-front/src/locales/sv/messages.json'
import svPages from '../bookclub-front/src/locales/sv/pages.json'

const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const RESET = '\x1b[0m'

const files = ['common', 'messages', 'pages'] as const

type TranslationObject = {
  [key: string]: string | TranslationObject
}

type TranslationFiles = Record<(typeof files)[number], TranslationObject>

const translations: Record<string, TranslationFiles> = {
  en: { common: enCommon, messages: enMessages, pages: enPages },
  fi: { common: fiCommon, messages: fiMessages, pages: fiPages },
  sv: { common: svCommon, messages: svMessages, pages: svPages }
}

const skippable = [
  'labels.points',
  'placeholder.bookForm.title',
  'placeholder.bookForm.author',
  'placeholder.bookForm.year',
  'placeholder.bookForm.pages',
  'placeholder.bookForm.isbn',
  'placeholder.misc.clubName'
]

const flattenJson = (obj: TranslationObject, prefix = '') => {
  const flattened: Record<string, string> = {}
  for (const key in obj) {
    const newKey = prefix ? `${prefix}.${key}` : key
    if (typeof obj[key] === 'string') {
      flattened[newKey] = obj[key]
    } else {
      Object.assign(flattened, flattenJson(obj[key], newKey))
    }
  }
  return flattened
}

const compareJson = (
  reference: Record<string, string>,
  target: Record<string, string>
) => {
  const missing = Object.keys(reference).filter(key => !(key in target) && !skippable.includes(key))
  const empty = Object.keys(target).filter(key => target[key] === '')
  const unexpected = Object.keys(target).filter(key => !(key in reference))

  if (missing.length === 0 && empty.length === 0 && unexpected.length === 0) {
    return undefined
  }

  return {
    missing: missing.length ? missing : undefined,
    empty: empty.length ? empty : undefined,
    unexpected: unexpected.length ? unexpected : undefined,
  }
}

const testTranslations = () => {
  const reference: Record<string, Record<string, string>> = {}
  for (const file of files) {
    reference[file] = flattenJson(translations.en[file])
  }

  const errors: string[] = []
  for (const locale in translations) {
    for (const file of files) {
      const comparison = compareJson(reference[file], flattenJson(translations[locale][file]))
      
      if (comparison?.missing) {
        comparison.missing.forEach(key => {
          errors.push(`${RED}[${locale}/${file}] ${RESET}${key} ${YELLOW}(missing)${RESET}`)
        })
      }

      if (comparison?.empty) {
        comparison.empty.forEach(key => {
          errors.push(`${RED}[${locale}/${file}] ${RESET}${key} ${YELLOW}(empty)${RESET}`)
        })
      }

      if (comparison?.unexpected) {
        comparison.unexpected.forEach(key => {
          errors.push(`${RED}[${locale}/${file}] ${RESET}${key} ${YELLOW}(unexpected)${RESET}`)
        })
      }
    }
  }

  if (errors.length > 0) {
    console.log('::error::Translation file error: missing / empty translation keys detected!\n')
    console.log(errors.join('\n'))
    console.log('\n')
    process.exitCode = 1
  } else {
    console.log('::notice::All translation file tests passed!')
  }
}

testTranslations()
