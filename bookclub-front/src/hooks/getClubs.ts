import { useEffect, useState } from "react"

import bookclubmembersService from '@/services/bookclubmembers'
import bookClubService, { type BookClub, type BookClubFields } from '@/services/bookclubs'

export const useGetClubs = () => {
  console.log("useGetClubs")
  const [list, setList] = useState<BookClubFields[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [dep, setDep] = useState<boolean>(false)
  const listMutated = () => setDep(prev => !prev)

  useEffect(() => void (async function() {
    // console.log("useEffect")
    // setErrorMessage(null)

    // await bookclubmembersService.get()
    //   .then(usersClubs => usersClubs.map((club: any) => club.bookclub_id))
    //   .then(clubIds => {
    //     console.log(1)
    //     bookClubService.get(clubIds).then(loadedClubs => setList(loadedClubs))
    //     console.log(2)
    //   })
    //   .catch(() => setErrorMessage('Failed to load bookclubs.'))
    //   .finally(() => setIsLoading(false))
      
      try {
        setErrorMessage(null)
        const usersClubs = await bookclubmembersService.get()
        console.log('users clubs after first call', usersClubs)
        const clubIds = usersClubs.map(
          (club: any) => club.bookclub_id
        )
        console.log('mappauksen jälkeen', clubIds)
        const loadedClubs = await bookClubService.get(clubIds)
        console.log('before', loadedClubs)
        setList([...loadedClubs])
        console.log('after', loadedClubs)
      } catch {
        setErrorMessage('Failed to load bookclubs.')
      } finally {
        setIsLoading(false)
      }
    console.log(list)
  }()), [dep])

  return { bookClubs: list, isLoading, errorMessage, listMutated }
}