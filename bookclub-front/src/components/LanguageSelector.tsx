import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectGroup, SelectValue, SelectTrigger, SelectSeparator } from '@/components/ui/select'
import { Languages } from "lucide-react"
import { useTranslation } from 'react-i18next'

const LanguageSelector = () => {
    const { t, i18n } = useTranslation('pages')

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
                    value={i18n.language}
                    onValueChange={(value) => {
                        localStorage.setItem('language', value)
                        void i18n.changeLanguage(value)
                    }}
                >
                    <SelectTrigger className='w-full min-w-0'>
                        <SelectValue placeholder={t(`settings.language.${i18n.language}`)} />
                    </SelectTrigger>
                    <SelectContent position='popper' className='w-(--radix-select-trigger-width) min-w-0'>
                        <SelectGroup className='py-4 sm:py-4'>
                            <SelectItem value='en'>
                                {t('settings.language.en')}
                            </SelectItem>
                            <SelectSeparator />
                            <SelectItem value='fi'>
                                {t('settings.language.fi')}
                            </SelectItem>
                            <SelectSeparator />
                            <SelectItem value='sv'>
                                {t('settings.language.sv')}
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>
    )
}

export default LanguageSelector
