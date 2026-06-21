import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BookclubComponent } from '@/components/BookclubComponent'
import BookList, { type BookListHandle } from '@/components/BookList'
import BookClubGoCycleSetting from '@/components/bookClubGoCycleSetting'
import cycleService from '@/services/cycle'
import { type CycleWithStatus } from '@/services/cycle'
import { SuggestBook } from '@/components/SuggestBook'
import bookclubmembersService from '@/services/bookclubmembers'
<<<<<<< HEAD
import { Grid } from '@/components/Grid'
=======
import CycleHistoryList from '@/components/CycleHistoryList'
>>>>>>> develop

const BookclubPage = () => {
	const { bookclubId } = useParams<{ bookclubId: string }>()
	const bookListRef = useRef<BookListHandle>(null)

	const [currentCycle, setCurrentCycle] = useState<CycleWithStatus>()
	const [loading, setLoading] = useState(true)
	const [isAdmin, setIsAdmin] = useState(false)

	useEffect(() => {
		const fetchCycle = async () => {
			try {
				const cycle = await cycleService.getLatestCycle(bookclubId as string)
				setCurrentCycle(cycle)
			} catch (error) {
				console.log(error)
			} finally {
				setLoading(false)
			}
		}

		const checkAdminStatus = async () => {
			try {
				const memberships = await bookclubmembersService.get()
				const isAdminMember = memberships.some(
					(member) => member.bookclub_id === bookclubId && member.user_role === 0
				)
				setIsAdmin(isAdminMember)
			} catch (error) {
				console.error('Failed to check admin status:', error)
				setIsAdmin(false)
			}
		}

		if (bookclubId) {
			void fetchCycle()
			void checkAdminStatus()
		}
	}, [bookclubId])

	const handleBookAdded = async () => {
		await bookListRef.current?.reload()
	}

	if (loading) return null

	// not in a book club
	if (!bookclubId) return <div>Missing bookclub id</div>

	return (
		<>
			<BookclubComponent bookclubId={bookclubId} />
			<Grid>
				{/* PROPOSAL PHASE */}
				{currentCycle?.phase === 'proposal' && (
					<>
						<SuggestBook
							onBookAdded={handleBookAdded}
							bookclubId={bookclubId}
							cycle_id={currentCycle.id}
						/>
						<BookList
							ref={bookListRef}
							show="proposedBooks"
							cycleId={currentCycle.id}
							description="Suggested books: "
							emptyMessage="No books suggested yet. Be the first to add one!"
						/>
					</>
				)}

<<<<<<< HEAD
				{/* VOTING PHASE */}
				{currentCycle?.phase === 'voting' && (
					<>
						<BookList ref={bookListRef} show="votedBooks" cycleId={currentCycle.id} />
					</>
				)}
=======
      {/* PROPOSAL PHASE */}
      {currentCycle?.phase === 'proposal' && (
        <>
          <SuggestBook
            onBookAdded={handleBookAdded}
            bookclubId={bookclubId}
            cycle_id={currentCycle.id}
          />
          <BookList
            ref={bookListRef}
            show="proposedBooks"
            cycleId={currentCycle.id}
            description="Suggested books: "
            emptyMessage="No books suggested yet. Be the first to add one!"
          />
        </>
      )}
>>>>>>> develop

				{/* RESULTS PHASE */}
				{currentCycle?.phase === 'over' && (
					<>
						<BookList ref={bookListRef} show="over" cycleId={currentCycle.id} />
					</>
				)}

<<<<<<< HEAD
				{/* Admin settings */}
				{isAdmin && <BookClubGoCycleSetting bookclubId={bookclubId} />}
			</Grid>
		</>
	)
=======
      {/* RESULTS PHASE */}
      {currentCycle?.phase === 'over' && (
        <>
          <BookList ref={bookListRef} show="over" cycleId={currentCycle.id} />
        </>
      )}

      <CycleHistoryList bookclubId={bookclubId} />

      {/* Admin settings */}
      {isAdmin && <BookClubGoCycleSetting bookclubId={bookclubId} />}
    </>
  )
>>>>>>> develop
}

export default BookclubPage
