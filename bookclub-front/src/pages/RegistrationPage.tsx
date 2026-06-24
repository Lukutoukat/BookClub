import RegistrationForm from '@/components/RegistrationForm'

import { PageHeader } from '@/components/PageHeader'
import { Column } from '@/components/Column'

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

			<Column>
				<RegistrationForm />
			</Column>
		</>
	)
}

export default RegistrationPage
