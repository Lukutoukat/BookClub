import { PageLayout } from '../components/PageLayout'
import { PageHeader } from '../components/PageHeader'
import { PageMenu } from '@/components/PageMenu'

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

      <div className="grid gap-5 lg:grid-cols-[minmax(320px,420px)_minmax(0,1fr)] sm:gap-8">
      </div>
    <PageMenu />
    </PageLayout>
  )
}

export default HomePage
