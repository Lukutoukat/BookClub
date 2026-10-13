import { useTranslation } from 'react-i18next'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeader } from '@/components/SectionHeader'

type Props = {
    votingSystem: string
    setVotingSystem: (system: string) => void
}

export const NewCycleSettings = ({ votingSystem, setVotingSystem }: Props) => {
    const { t } = useTranslation('pages')

    let votingSystemDescription

    if (votingSystem === 'binary') {
        votingSystemDescription = t('newCycleSettings.binaryDescription')
    } else {
        votingSystemDescription = t('newCycleSettings.threeLevelDescription')
    }

    return (
        <Card className="card-base">
				<SectionHeader title={t('newCycleSettings.title')} description={t('newCycleSettings.description')} />
				<CardContent className="card-content">
					<div>
						<p>{t('newCycleSettings.votingSystem')}</p>
						<div className="flex flex-col items-start gap-2"> {/* Alternative: flex items-start gap-6 */}
							<Select value={votingSystem} onValueChange={setVotingSystem}>
								<SelectTrigger aria-label={t('newCycleSettings.votingSystem')}>
									<SelectValue />
								</SelectTrigger>

								<SelectContent>
									<SelectItem value="three-level">{t('newCycleSettings.threeLevel')}</SelectItem>
									<SelectItem value="binary">{t('newCycleSettings.binary')}</SelectItem>
								</SelectContent>
							</Select>

							<div className="text-sm text-muted-foreground">
                                <p>{votingSystemDescription}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
    )
}