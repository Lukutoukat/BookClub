import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectGroup, SelectValue, SelectTrigger, SelectSeparator } from '@/components/ui/select'
import { Languages } from "lucide-react"
import { useTranslation } from 'react-i18next'

const LanguageSelector = () => {
    const { t, i18n } = useTranslation('pages')
    const availableLanguages = Object.keys(i18n.services.resourceStore.data)
    const currentLanguage = i18n.resolvedLanguage ?? i18n.language

    const displayName = (lng: string) => {
        const name = new Intl.DisplayNames([lng], { type: 'language' }).of(lng) ?? lng
        return name.charAt(0).toLocaleUpperCase(lng) + name.slice(1)
    }

    return (
        <Card className='border-border/60 bg-card/90 shadow-lg shadow-slate-950/5 backdrop-blur'>
            <CardHeader className='border-b border-border/60 py-4 sm:py-2'>
                <CardTitle className='text-xl sm:text-2xl flex items-center gap-2'>
                    <Languages className='w-5 h-5' />
                    {t('settings.language.title')}
                </CardTitle>
                <CardDescription>
                    {t('settings.language.description')}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Select 
                    value={currentLanguage}
                    onValueChange={(value) => {
                        localStorage.setItem('language', value)
                        void i18n.changeLanguage(value)
                    }}
                >
                    <SelectTrigger className='w-full min-w-0'>
                        <SelectValue>
                            {displayName(currentLanguage)}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent position='popper' className='w-(--radix-select-trigger-width) min-w-0'>
                        <SelectGroup className='py-4 sm:py-4'>
                            {availableLanguages.map((lng, index) => (
                                <div key={lng}>
                                    <SelectItem value={lng}>
                                        {displayName(lng)}
                                    </SelectItem>
                                    {index < availableLanguages.length - 1 && <SelectSeparator />}
                                </div>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>
    )
}

export default LanguageSelector
