<<<<<<< HEAD
import { PageHeader } from "../components/PageHeader";
import BookClubList from "@/components/BookClubList";
import JoinBookClubForm from "@/components/JoinBookClubForm";
import { useGetClubs } from "@/hooks/getClubs";
=======
import { PageHeader } from '../components/PageHeader'
import BookClubList from '@/components/BookClubList'
import JoinBookClubForm from '@/components/JoinBookClubForm'
import { useGetClubs } from '@/hooks/getClubs'
import { UserLoginDisplay } from '@/components/UserLoginDisplay'
>>>>>>> main

const HomePage = () => {
  const { bookClubs, isLoading, errorMessage, listMutated } = useGetClubs();

  return (
    <>
      <UserLoginDisplay />
      <PageHeader
        badgeText="Home"
        title="Clubs, books and more"
        description="Manage your book clubs, suggest new books and make decisions together."
      />

      <BookClubList
        bookClubs={bookClubs}
        isLoading={isLoading}
        errorMessage={errorMessage}
      />
      <JoinBookClubForm listMutated={listMutated} />
    </>
  );
};

export default HomePage;
