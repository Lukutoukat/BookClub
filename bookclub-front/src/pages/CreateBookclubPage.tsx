import { useState } from 'react'

import BookclubForm from '../components/BookclubForm'
import bookclubService, { type CreateBookclub } from '../services/bookclubs'
import { PageLayout } from '../components/PageLayout'
import { PageHeader } from '../components/PageHeader'
import { PageMenu } from '@/components/PageMenu'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

const emptyBookclub: CreateBookclub = {
  name: '',
}

const CreateBookclubPage = () => {
    const [newBookclub, setNewBookclub] = useState<CreateBookclub>(emptyBookclub)

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = event.target

        setNewBookclub((currentBookclub) => ({
        ...currentBookclub,
        [name]: value
        }))
    }

    const addBookclub = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()
        await bookclubService.create(newBookclub)
    }

    return (
        <PageLayout>
        <PageHeader
            badgeText="Create a bookclub"
            title="New bookclub"
            description="Create a new bookclub for you and your friends to enjoy reading together."
            buttonText="Back to books"
            buttonLink="/books"
        />

            <Card className="border-border/60 bg-card/90 shadow-lg shadow-slate-950/5 backdrop-blur">
            <CardHeader className="border-b border-border/60 py-4 sm:py-6">
                <CardTitle className="text-xl sm:text-2xl">Create a new bookclub</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                Create a new book club, where you can invite your friends.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4 sm:space-y-4 sm:pt-6">
                <BookclubForm
                    addBookclub={addBookclub}
                    newBookclub={newBookclub}
                    handleChange={handleChange}
                />
                </CardContent>
            </Card>
        <PageMenu />
        </PageLayout>
    )
}

export default CreateBookclubPage