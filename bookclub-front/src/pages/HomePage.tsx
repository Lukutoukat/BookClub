import { PageLayout } from '../components/PageLayout'
import { PageHeader } from '../components/PageHeader'
import { PageMenu } from '@/components/PageMenu'
import BookClubList from '@/components/BookClubList'

const HomePage = () => {

  return (
    <PageLayout>
      <PageHeader
        badgeText="Home"
        title="Clubs, books and more"
        description="Explore your book club, suggest books, decide together, and keep track of your reading list easily."
        buttonText="Go to books"
        buttonLink="/books"
      />

      <BookClubList />
    <PageMenu />
    </PageLayout>
  )
}

export default HomePage
