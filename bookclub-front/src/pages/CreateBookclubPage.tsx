import BookclubForm from '@/components/BookclubForm'
import { UserLoginDisplay } from '@/components/UserLoginDisplay'
import { PageHeader } from '../components/PageHeader'

const CreateBookclubPage = () => {
    return (
        <>
        <UserLoginDisplay />
        <PageHeader
            badgeText="Create"
            title="New book club"
            description="Create a new book club for you and your friends to enjoy reading together."
        />
        <BookclubForm />
        </>
    )
}

export default CreateBookclubPage