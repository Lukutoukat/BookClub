import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

type TranslationObject = {
  [key: string]: string | TranslationObject
}

const RED = '\x1b[31m'
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const RESET = '\x1b[0m'

const skippable = [
  'labels.points',
  'placeholder.bookForm.title',
  'placeholder.bookForm.author',
  'placeholder.bookForm.year',
  'placeholder.bookForm.pages',
  'placeholder.bookForm.isbn',
  'placeholder.misc.clubName'
]

const localesRoot = path.resolve(__dirname, '../bookclub-front/src/locales')
const locales = readdirSync(localesRoot, { withFileTypes: true })
  .filter(locale => locale.isDirectory())
  .map(locale => locale.name)
  
const namespaces = readdirSync(path.join(localesRoot, 'en'))
  .filter(file => file.endsWith('.json'))
  .map(file => path.basename(file, '.json'))

const translations: Record<string, Record<string, TranslationObject>> = {}
for (const locale of locales) {
  const localePath = path.join(localesRoot, locale)
  const files = readdirSync(localePath)
    .filter(file => file.endsWith('.json'))

  translations[locale] = {}
  for (const file of files) {
    const namespace = path.basename(file, '.json')
    const filePath = path.join(localePath, file)

    translations[locale][namespace] = JSON.parse(
      readFileSync(filePath, 'utf-8')
    )
  }
}

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

  return {
    missing,
    empty,
    unexpected,
  }
}

const testTranslations = () => {
  const reference: Record<string, Record<string, string>> = {}
  for (const namespace of namespaces) {
    reference[namespace] = flattenJson(translations.en[namespace])
  }

  const errors: string[] = []
  const addErrors = (keys: string[], locale: string, namespace: string, type: string) => {
    keys.forEach(key => {
      errors.push(`${RED}[${locale}/${namespace}] ${RESET}${key} ${YELLOW}(${type})${RESET}`)
    })
  }

  for (const locale in translations) {
    for (const namespace in translations[locale]) {
      if (!namespaces.includes(namespace)) {
        addErrors(['namespace'], locale, namespace, 'unexpected')
      }
    }
    
    for (const namespace of namespaces) {
      if (!translations[locale][namespace]) {
        addErrors(['namespace'], locale, namespace, 'missing')
        continue
      }

      const comparison = compareJson(reference[namespace], flattenJson(translations[locale][namespace]))
      
      addErrors(comparison.missing, locale, namespace, 'missing')
      addErrors(comparison.empty, locale, namespace, 'empty')
      addErrors(comparison.unexpected, locale, namespace, 'unexpected')
    }
  }

  if (errors.length > 0) {
    console.log('::error::Translation file issues detected!\n')
    console.log(errors.join('\n'))
    console.log('')
    process.exitCode = 1
  } else {
    console.log(`${GREEN}All translation file tests passed!${RESET}`)
  }
}

testTranslations()
