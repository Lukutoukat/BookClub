import { PageHeader } from '../components/PageHeader'
import BookClubList from '@/components/BookClubList'
import { Grid } from '@/components/Grid'
import JoinBookClubForm from '@/components/JoinBookClubForm'

const HomePage = () => {

  return (
    <>
      <PageHeader
        badgeText="Home"
        title="Clubs, books and more"
        description="Explore your book club, suggest books, decide together, and keep track of your reading list easily."
      />
      <Grid>
        <BookClubList />
        <JoinBookClubForm />
      </Grid>
    </>
  )
}

export default HomePage
