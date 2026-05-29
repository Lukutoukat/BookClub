import BookclubForm from '../components/BookclubForm'

import { PageHeader } from '../components/PageHeader'

const CreateBookclubPage = () => {
    return (
        <>
        <PageHeader
            badgeText="Create a bookclub"
            title="New bookclub"
            description="Create a new bookclub for you and your friends to enjoy reading together."
            buttonText="Back to books"
            buttonLink="/books"
        />
        <BookclubForm />
        </>
    )
}

export default CreateBookclubPage