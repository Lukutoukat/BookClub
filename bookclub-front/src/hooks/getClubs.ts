import { useEffect, useState } from 'react'

import bookClubService, { type BookClubFields } from '@/services/bookclubs'

export const useGetClubs = () => {
	const [list, setList] = useState<BookClubFields[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	const [dep, setDep] = useState<boolean>(false)
	const listMutated = () => setDep((prev) => !prev)

	useEffect(
		() =>
			void (async function () {
				try {
					setErrorMessage(null)
					const usersClubs = await bookClubService.getAll();
					setList([...usersClubs])
				} catch {
					setErrorMessage('Failed to load bookclubs.')
				} finally {
					setIsLoading(false)
				}
			})(),
		[dep]
	)

	return { bookClubs: list, isLoading, errorMessage, listMutated }
}
