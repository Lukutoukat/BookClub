import BookclubForm from '@/components/BookclubForm'
import { PageHeader } from '../components/PageHeader'
import { Column } from '@/components/Column'

const CreateBookclubPage = () => {
	return (
		<>
			<PageHeader
				badgeText="Create"
				title="New book club"
				description="Create a new book club for you and your friends to enjoy reading together."
			/>
			<Column>
				<BookclubForm />
			</Column>
		</>
	)
}

export default CreateBookclubPage
