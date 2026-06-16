import { useEffect, useState } from "react";

import bookclubmembersService from "@/services/bookclubmembers";
import bookClubService, { type BookClubFields } from "@/services/bookclubs";

export const useGetClubs = () => {
  const [list, setList] = useState<BookClubFields[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [dep, setDep] = useState<boolean>(false);
  const listMutated = () => setDep((prev) => !prev);

  useEffect(
    () =>
      void (async function () {
        try {
          setErrorMessage(null);
          const usersClubs = await bookclubmembersService.get();
          const clubIds = usersClubs.map((club) => club.bookclub_id);
          const loadedClubs = await bookClubService.get(clubIds);
          setList([...loadedClubs]);
        } catch {
          setErrorMessage("Failed to load bookclubs.");
        } finally {
          setIsLoading(false);
        }
      })(),
    [dep],
  );

  return { bookClubs: list, isLoading, errorMessage, listMutated };
};
