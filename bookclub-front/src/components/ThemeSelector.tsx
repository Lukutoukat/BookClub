import { useState } from 'react'
import { Palette } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import { getInitialTheme, applyThemeToDOM, saveTheme, type Theme } from '@/lib/theme'
import { useTranslation } from 'react-i18next'

const ThemeSelector = () => {
	const { t } = useTranslation('pages')
	const [theme, setTheme] = useState<Theme>(getInitialTheme())

	const applyTheme = (newTheme: Theme): void => {
		setTheme(newTheme)
		applyThemeToDOM(newTheme)
		saveTheme(newTheme)
	}

	return (
		<Card className="border-border/60 bg-card/90 shadow-lg shadow-slate-950/5 backdrop-blur">
			<CardHeader className="border-b border-border/60 py-4 sm:py-8">
				<CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
					<Palette className="w-5 h-5" />
					{t('settings.theme.title')}
				</CardTitle>
				<CardDescription className="text-sm sm:text-base">
					{t('settings.theme.description')}
				</CardDescription>
			</CardHeader>

			<CardContent className="py-4 sm:py-8">
				<div className="flex gap-2">
					<Button
						variant={theme === 'light' ? 'default' : 'outline'}
						onClick={() => applyTheme('light')}
						className="flex-1"
					>
						{t('settings.theme.light')}
					</Button>
					<Button
						variant={theme === 'dark' ? 'default' : 'outline'}
						onClick={() => applyTheme('dark')}
						className="flex-1"
					>
						{t('settings.theme.dark')}
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}

export default ThemeSelector
