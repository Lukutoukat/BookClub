import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeader } from '@/components/SectionHeader'

type Props = {
    votingSystem: string
    setVotingSystem: (system: string) => void
}

export const NewCycleSettings = ({ votingSystem, setVotingSystem }: Props) => {
    let votingSystemDescription

    if (votingSystem === 'binary') {
        votingSystemDescription = (
            <div className="text-sm text-muted-foreground">
                <p>Binary voting system: Each member can vote for or against each book proposal. Cant change afterwards.</p>
            </div>
        )
    } else {
        votingSystemDescription = (
            <div className="text-sm text-muted-foreground">
                <p>Three-level voting system: Each member rates how willing they are to read each proposed book:
                     want to read, could read, or do not want to read. Cant change afterwards.</p>
            </div>
        )
    }

    return (
        <Card className="card-base">
				<SectionHeader title="Settings" description="Settings for this cycle" />
				<CardContent className="card-content">
					<div>
						<p>Voting System</p>
						<div className="flex flex-col items-start gap-2"> {/* Alternative: flex items-start gap-6 */}
							<Select value={votingSystem} onValueChange={setVotingSystem}>
								<SelectTrigger aria-label="Voting system">
									<SelectValue />
								</SelectTrigger>

								<SelectContent>
									<SelectItem value="three-level">Three-Level</SelectItem>
									<SelectItem value="binary">Binary</SelectItem>
								</SelectContent>
							</Select>

							{votingSystemDescription}

						</div>
					</div>
				</CardContent>
			</Card>
            )
}