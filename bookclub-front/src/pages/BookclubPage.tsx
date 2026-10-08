import {useEffect, useMemo, useRef, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {BookclubComponent} from '@/components/BookclubComponent'
import BookList, {type BookListHandle} from '@/components/BookList'
import BookClubGoCycleSetting from '@/components/bookClubGoCycleSetting'
import cycleService, {type CycleWithStatus} from '@/services/cycle'
import {SuggestBook} from '@/components/SuggestBook'
import CycleHistoryList from '@/components/CycleHistoryList'
import {BookclubMemberList} from '@/components/BookclubMemberList'
import {Card, CardContent} from '@/components/ui/card'
import {SectionHeader} from '@/components/SectionHeader'
import {ButtonDialog} from '@/components/ButtonDialog.tsx'
import {type Tab, TabbedColumn} from '@/components/TabbedColumn.tsx'
import {Skeleton} from "@/components/ui/skeleton.tsx";


/**
 *  HOME TAB
 */
interface HomeTabProps {
	bookclubId: string,
}

const HomeTab = ({bookclubId}: HomeTabProps) => {
	const [currentCycle, setCurrentCycle] = useState<CycleWithStatus>()
	const [loading, setLoading] = useState(true)
	const bookListRef = useRef<BookListHandle>(null)

	useEffect(() => {
		const fetchCycle = async () => {
			try {
				const cycle = await cycleService.getLatestCycle(bookclubId)
				setCurrentCycle(cycle)
			} catch (error) {
				console.log(error)
			} finally {
				setLoading(false)
			}
		}

		void fetchCycle()
	}, [bookclubId])

	const handleBookAdded = async () => {
		await bookListRef.current?.reload()
	}

	// Return a loading skeleton
	if (loading) {
		return (
			<Skeleton>
				<Card className="h-30"/>
			</Skeleton>
		)
	}

	return (<>
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
						description="Suggested books "
						emptyMessage="No books suggested yet. Be the first to add one!"
					/>
				</>
			)}

			{/* VOTING PHASE */}
			{currentCycle?.phase === 'voting' && (
				<>
					<BookList ref={bookListRef} show="votedBooks" cycleId={currentCycle.id}/>
				</>
			)}

			{/* RESULTS PHASE */}
			{currentCycle?.phase === 'over' && (
				<>
					<BookList ref={bookListRef} show="over" cycleId={currentCycle.id}/>
				</>
			)}
		</>
	)
}


/**
 *  MEMBERS TAB
 */
interface MembersTabProps {
	bookclubId: string
}

const MembersTab = ( {bookclubId} : MembersTabProps ) => {
	return (
		<>
			{/* CLUB MEMBER LIST */}
			<Card>
				<SectionHeader title="Club Members"/>
				<CardContent>
					<BookclubMemberList
						bookclubId={bookclubId}
						canManageMembers={false}
						className="member-list"
					/>
				</CardContent>
			</Card>
		</>
	)
}

/**
 *  HISTORY TAB
 */
interface HistoryTabProps {
	bookclubId: string
}

const HistoryTab = ( {bookclubId } : HistoryTabProps) => {
	return (
		<>
			<CycleHistoryList bookclubId={bookclubId}/>
		</>
	)
}

/**
 *  SETTINGS TAB
 */
interface SettingsTabProps {
	bookclubId: string
}

const SettingsTab = ( {bookclubId } : SettingsTabProps) => {
	return (<>
			<BookClubGoCycleSetting bookclubId={bookclubId}/>
			<br/>
			<Card className="card-base">
				<SectionHeader
					title="Manage Members"
					description="You can manage individual members below"
				/>
				<CardContent>
					<BookclubMemberList
						bookclubId={bookclubId}
						canManageMembers={true}
						className="member-list"
					/>
				</CardContent>
				<SectionHeader
					title="Manage Club"
					description="You can remove your book club and all information related to it below"
				/>
				<CardContent className="card-content">
					<ButtonDialog
						buttonText="Delete club"
						alertDialogDescription="Once the book club is deleted, it cannot be undone."
						alertDialogContinueText="Delete"
						alertDialogText="Are you sure you want to delete this book club?"
					/>
				</CardContent>
			</Card>
		</>
	)
}

/**
 *  PAGE
 */
const BookclubPage = () => {
	const { bookclubId } = useParams<{ bookclubId: string }>()
	const navigate = useNavigate()

	// Missing ID parameter
	// -> Redirect to home page
	if (!bookclubId) {
		void navigate('/home')
		return null
	}

	// Create memoized tabs
	const tabs: Tab[] = useMemo<Tab[]>(() =>
		[
			{
				id: 'home',
				label: 'Home',
				content: <HomeTab bookclubId={bookclubId}/>
			},
			{
				id: 'members',
				label: 'Members',
				content: <MembersTab bookclubId={bookclubId}/>
			},
			{
				id: 'history',
				label: 'History',
				content: <HistoryTab bookclubId={bookclubId}/>
			},
			{
				id: 'settings',
				label: 'Settings',
				content: <SettingsTab bookclubId={bookclubId}/>
			}
		], [bookclubId])

	return (
		<>
			<BookclubComponent bookclubId={bookclubId} />
			<TabbedColumn tabs={tabs} />
		</>
	)
}

export default BookclubPage
