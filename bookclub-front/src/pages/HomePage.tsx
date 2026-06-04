import { PageHeader } from '../components/PageHeader'
import BookClubList from '@/components/BookClubList'
import JoinBookClubForm from '@/components/JoinBookClubForm'
import { useGetClubs } from '@/hooks/getClubs'

const HomePage = () => {
  const { bookClubs, isLoading, errorMessage, listMutated } = useGetClubs()

  return (
    <>
      <PageHeader
        badgeText="Home"
        title="Clubs, books and more"
        description="Explore your book club, suggest books, decide together, and keep track of your reading list easily."
      />

      <BookClubList bookClubs={bookClubs} isLoading={isLoading} errorMessage={errorMessage}/>
      <JoinBookClubForm listMutated={listMutated}/>
    </>
  )
}

export default HomePage
