import i18n from 'i18next';

export const LANGUAGES = {
    fin: 'languages.fin',
    eng: 'languages.eng',
    swe: 'languages.swe',
    rus: 'languages.rus',
    deu: 'languages.deu',
    est: 'languages.est',
    fra: 'languages.fra',
    spa: 'languages.spa',
    ara: 'languages.ara',
    zho: 'languages.zho',
    fas: 'languages.fas',
    ita: 'languages.ita',
    ukr: 'languages.ukr',
    tur: 'languages.tur',
    jpn: 'languages.jpn',
    por: 'languages.por',
    vie: 'languages.vie',
    sqi: 'languages.sqi',
    tha: 'languages.tha',
    dan: 'languages.dan',
    nor: 'languages.nor',
    pol: 'languages.pol',
    som: 'languages.som',
    bem: 'languages.bem',
    ckb: 'languages.ckb',
    hun: 'languages.hun',
    ron: 'languages.ron',
    kur: 'languages.kur',
} as const;

export type LanguageCode = keyof typeof LANGUAGES;

export function getLanguageCodes(): LanguageCode[] {
    return Object.keys(LANGUAGES) as LanguageCode[];
}

export function getLanguageLabel(code: LanguageCode): string {
    return i18n.t(LANGUAGES[code], {ns: "common"});
}

export function isLanguageCode(value: string): value is LanguageCode {
    return Object.prototype.hasOwnProperty.call(LANGUAGES, value);
}
