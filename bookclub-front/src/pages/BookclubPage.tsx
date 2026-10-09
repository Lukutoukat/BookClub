import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BookclubComponent } from '@/components/BookclubComponent'
import BookList, { type BookListHandle } from '@/components/BookList'
import BookClubGoCycleSetting from '@/components/bookClubGoCycleSetting'
import cycleService from '@/services/cycle'
import { type CycleWithStatus } from '@/services/cycle'
import { SuggestBook } from '@/components/SuggestBook'
import bookclubmembersService from '@/services/bookclubmembers'
import { Column } from '@/components/Column'
import CycleHistoryList from '@/components/CycleHistoryList'
import { BookclubMemberList } from '@/components/BookclubMemberList'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeader } from '@/components/SectionHeader'
import { useTranslation } from 'react-i18next'

const BookclubPage = () => {
	const { t } = useTranslation('pages')
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

	if (!bookclubId) return <div>{t('club.missingId')}</div>

	return (
		<>
			<BookclubComponent bookclubId={bookclubId} />
			<Column>
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
							description={t('club.cycle.bookList.suggestedDescription')}
							emptyMessage={t('club.cycle.bookList.empty')}
						/>
					</>
				)}

				{/* VOTING PHASE */}
				{currentCycle?.phase === 'voting' && (
					<>
						<BookList ref={bookListRef} show="votedBooks" cycleId={currentCycle.id} votingSystem={currentCycle.votingSystem} />
					</>
				)}

				{/* RESULTS PHASE */}
				{currentCycle?.phase === 'over' && (
					<>
						<BookList ref={bookListRef} show="over" cycleId={currentCycle.id} />
					</>
				)}

				<CycleHistoryList bookclubId={bookclubId} />

				{/* CLUB MEMBER LIST */}
				<Card>
					<SectionHeader 
						title={t('club.members.title')}
					/>
					<CardContent>
						<BookclubMemberList 
							bookclubId={bookclubId}
							canManageMembers={false}
							className='member-list'
						/>
					</CardContent>
				</Card>

				{/* Admin settings */}
				{isAdmin && <BookClubGoCycleSetting bookclubId={bookclubId} />}
			</Column>
		</>
	)
}

export default BookclubPage
