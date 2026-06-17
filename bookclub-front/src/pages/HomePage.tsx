import { PageHeader } from '../components/PageHeader'
import BookClubList from '@/components/BookClubList'
import JoinBookClubForm from '@/components/JoinBookClubForm'
import { useGetClubs } from '@/hooks/getClubs'
import { Grid } from '@/components/Grid'

const HomePage = () => {
  const { bookClubs, isLoading, errorMessage, listMutated } = useGetClubs();

  return (
    <>
      <PageHeader
        badgeText="Home"
        title="Clubs, books and more"
        description="Manage your book clubs, suggest new books and make decisions together."
      />
      <Grid>
        <BookClubList
          bookClubs={bookClubs}
          isLoading={isLoading}
          errorMessage={errorMessage}
        />
        <JoinBookClubForm listMutated={listMutated} />
      </Grid>
    </>
  );
};

export default HomePage;
