import BookclubForm from '@/components/BookclubForm'

import { PageLayout } from '@/components/PageLayout'
import { PageHeader } from '@/components/PageHeader'

const CreateBookclubPage = () => {
    return (
        <PageLayout>
        <PageHeader
            badgeText="Create a bookclub"
            title="New bookclub"
            description="Create a new bookclub for you and your friends to enjoy reading together."
            buttonText="Back to books"
            buttonLink="/books"
        />
        <BookclubForm />
        </PageLayout>
    )
}

export default CreateBookclubPage