import RegistrationForm from '@/components/RegistrationForm'

import { PageHeader } from '@/components/PageHeader'
import { Grid } from '@/components/Grid'

const RegistrationPage = () => {
	return (
		<>
			<PageHeader
				badgeText="Registration"
				title="Join the club"
				description=""
				buttonText="Go to login"
				buttonLink="/login"
			/>

			<Grid>
				<RegistrationForm />
			</Grid>
		</>
	)
}

export default RegistrationPage
