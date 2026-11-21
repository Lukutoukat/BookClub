import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

type TranslationObject = {
  [key: string]: string | TranslationObject
}

const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const RESET = '\x1b[0m'

const localesRoot = path.resolve(__dirname, '../bookclub-front/src/locales')
const locales = readdirSync(localesRoot, { withFileTypes: true })
  .filter(locale => locale.isDirectory())
  .map(locale => locale.name)

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

const files = ['common', 'messages', 'pages'] as const

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
    console.log('::error::Translation file issues detected!\n')
    console.log(errors.join('\n'))
    console.log('')
    process.exitCode = 1
  } else {
    console.log('::notice::All translation file tests passed!')
  }
}

testTranslations()
