import {useEffect, useMemo, useRef, useState} from 'react'
import {Link, useNavigate, useParams} from 'react-router-dom'
import {BookclubComponent} from '@/components/BookclubComponent'
import BookList, {type BookListHandle} from '@/components/BookList'
import cycleService, {type CycleWithStatus} from '@/services/cycle'
import bookclubService from '@/services/bookclubs'
import bookclubmembersService from '@/services/bookclubmembers'
import {SuggestBook} from '@/components/SuggestBook'
import CycleHistoryList from '@/components/CycleHistoryList'
import {BookclubMemberList} from '@/components/BookclubMemberList'
import {Card, CardContent} from '@/components/ui/card'
import {SectionHeader} from '@/components/SectionHeader'
import {type Tab, TabbedColumn} from '@/components/TabbedColumn.tsx'
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {getErrorMessage} from "@/lib/errorMessage.ts";
import {useNotification} from "@/context/NotificationContext.tsx";
import { useTranslation } from 'react-i18next'
import { ButtonDialog } from '@/components/ButtonDialog'
import { Button } from '@/components/ui/button'

/**
 *  HOME TAB
 */
interface HomeTabProps {
	bookclubId: string,
}

const HomeTab = ({bookclubId}: HomeTabProps) => {
	const {t} = useTranslation('pages')
	const {showError} = useNotification()

	const [currentCycle, setCurrentCycle] = useState<CycleWithStatus>()
	const [loading, setLoading] = useState(true)
	const bookListRef = useRef<BookListHandle>(null)

	useEffect(() => {
		const fetchCycle = async () => {
			try {
				const cycle = await cycleService.getLatestCycle(bookclubId)
				setCurrentCycle(cycle)
			} catch (error) {
				showError(getErrorMessage(error))
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
					<br/>
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
					<BookList ref={bookListRef} show="votedBooks" cycleId={currentCycle.id} votingSystem={currentCycle.votingSystem}/>
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
	const {t} = useTranslation('pages')

	return (
		<>
			{/* CLUB MEMBER LIST */}
			<Card>
				<SectionHeader title={t('club.members.title')}/>
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
	isAdmin: boolean
}

const SettingsTab = ( {bookclubId, isAdmin } : SettingsTabProps) => {
	const { t } = useTranslation('pages')
	const navigate = useNavigate()
	const { showError } = useNotification()
	const handleDeletion = async (event: React.SyntheticEvent<HTMLButtonElement>) => {
		event.preventDefault()
		try {
			await bookclubService.remove(bookclubId)
			await navigate('/home', { replace: true })
		} catch (error) {
			const errorMessage = getErrorMessage(error)
			showError('Failed to delete club: ' + errorMessage)
		}
	}
	
	return (
		<>
			{isAdmin && (
				<Card className="card-base">
					<SectionHeader 
						title={t('club.settings.manageMembers.title')}
						description={t('club.settings.manageMembers.description')}
					/>
					<CardContent>
						<BookclubMemberList 
							bookclubId={bookclubId}
							canManageMembers={true}
							className='member-list'
						/>	
					</CardContent>
					<SectionHeader
						title={t('club.settings.manageCycle.title')}
						description={t('club.settings.manageCycle.description')}
					/>
					<CardContent className='card-content'>
						<Button asChild className="flex-1 min-w-0">
							<Link to={`/newcycle/${bookclubId}`}>{t('actions.manageCycle', { ns: 'common' })}</Link>
						</Button>
					</CardContent>
					<SectionHeader
						title={t('club.settings.manageClub.title')}
						description={t('club.settings.manageClub.description')}
					/>
					<CardContent className="card-content">
						<ButtonDialog
							buttonText={t('actions.deleteClub', { ns: 'common' })}
							buttonOnClick={handleDeletion}
							alertDialogDescription={t('club.settings.deleteWarning')}
							alertDialogContinueText={t('actions.delete', { ns: 'common' })}
							alertDialogText={t('club.settings.deleteQuestion')}
						/>
					</CardContent>
				</Card>
			)}
		</>
	)
}

/**
 *  PAGE
 */
const BookclubPage = () => {
	const {t} = useTranslation('pages')
	const { bookclubId } = useParams<{ bookclubId: string }>()
	const [isAdmin, setIsAdmin] = useState(false)
	const { showError } = useNotification()
	const navigate = useNavigate()

	useEffect(() => {
		const checkAdminStatus = async () => {
			try {
				const memberships = await bookclubmembersService.get()
				const isAdminMember = memberships.some(
					(member) => member.bookclub_id === bookclubId && member.user_role === 0
				)
				setIsAdmin(isAdminMember)
			} catch (error) {
				const errorMessage = getErrorMessage(error)
				showError('Failed to check admin status: ' + errorMessage)
				setIsAdmin(false)
			}
		}

		if (bookclubId) {
			void checkAdminStatus()
		}
	}, [bookclubId])

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
				label: t('club.tabs.home'),
				content: <HomeTab bookclubId={bookclubId}/>
			},
			{
				id: 'members',
				label: t('club.tabs.members'),
				content: <MembersTab bookclubId={bookclubId}/>
			},
			{
				id: 'history',
				label: t('club.tabs.history'),
				content: <HistoryTab bookclubId={bookclubId}/>
			},
			{
				id: 'settings',
				label: t('club.tabs.settings'),
				content: <SettingsTab bookclubId={bookclubId} isAdmin={isAdmin}/>
			}
		], [bookclubId, isAdmin, t])

	return (
		<>
			<BookclubComponent bookclubId={bookclubId} />
			<TabbedColumn tabs={tabs} />
		</>
	)
}

export default BookclubPage
