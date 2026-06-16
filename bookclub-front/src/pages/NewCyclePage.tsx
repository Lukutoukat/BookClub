import { useParams } from 'react-router-dom'
import { NewCycle } from '@/components/NewCycle'
import { UserLoginDisplay } from '@/components/UserLoginDisplay'
import { EndPhase } from '@/components/EndPhase'
import { PageHeader } from '@/components/PageHeader';
import { useNavigate } from "react-router-dom";
import bookClubService, { type BookClub } from '@/services/bookclubs'
import React, { useState, useEffect } from 'react';

const NewCyclePage = () => {
  const { bookclubId } = useParams<{ bookclubId: string }>();
  const [loadedClubs, setLoadedClubs] = useState<BookClub[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!bookclubId) return;

    let isMounted = true;
    setIsLoading(true);

    bookClubService.get([bookclubId])
      .then((clubs) => {
        if (isMounted) {
          setLoadedClubs(clubs);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching book clubs:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      });

  if (!bookclubId) return <div>Missing bookclub id</div>;

  return (
    <>
      <UserLoginDisplay />
      <PageHeader
        badgeText="New Cycle"
        title={loadedClubs[0]?.name ?? "Bookclub"}
        description=""
        buttonText="Back"
        buttonOnClick={async () => {
          await navigate(`/club/${bookclubId}`);
        }}
      />
      <NewCycle bookclubId={bookclubId} />
      <EndPhase bookclubId={bookclubId} />
    </>
  );
};

export default NewCyclePage;
