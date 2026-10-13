import {render, screen, waitFor} from '@/utils/test-utils'
import {describe, expect, it, vi, beforeEach} from 'vitest'
import userEvent from '@testing-library/user-event'
import {forwardRef, useImperativeHandle, type Ref, type SyntheticEvent} from 'react'

import BookclubPage from '@/pages/BookclubPage'
import cycleService from '@/services/cycle'
import bookclubmembersService from '@/services/bookclubmembers'
import bookclubService from '@/services/bookclubs'

const {mockReload, mockShowError} = vi.hoisted(() => ({
    mockReload: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
    mockShowError: vi.fn(),
}))

const mockUseParams = vi.fn()
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>()
    return {
        ...actual,
        useParams: () => mockUseParams(),
        useNavigate: () => mockNavigate,
    }
})

vi.mock('@/services/cycle')
vi.mock('@/services/bookclubmembers')
vi.mock('@/services/bookclubs')

vi.mock('@/context/NotificationContext.tsx', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/context/NotificationContext.tsx')>()
    return {
        ...actual,
        useNotification: () => ({showError: mockShowError}),
    }
})

vi.mock('@/components/BookclubComponent', () => ({
    BookclubComponent: ({bookclubId}: { bookclubId: string }) => (
        <div>Bookclub details for {bookclubId}</div>
    ),
}))

vi.mock('@/components/BookList', () => ({
    default: forwardRef((_props: Record<string, unknown>, ref: Ref<unknown>) => {
        useImperativeHandle(ref, () => ({reload: mockReload}))
        return <div>Book list</div>
    }),
}))

vi.mock('@/components/SuggestBook', () => ({
    SuggestBook: ({onBookAdded}: { onBookAdded: () => void | Promise<void> }) => (
        <div>
            Suggest a book
            <button onClick={() => void onBookAdded()}>Trigger book added</button>
        </div>
    ),
}))

vi.mock('@/components/bookClubGoCycleSetting', () => ({
    default: () => (
        <div>
            <div>Manage cycle</div>
            <div>Manage club</div>
        </div>
    ),
}))

vi.mock('@/components/CycleHistoryList', () => ({
    default: () => <div>Cycle history</div>,
}))

vi.mock('@/components/ButtonDialog', () => ({
    ButtonDialog: ({buttonText, buttonOnClick}: {
        buttonText: string
        buttonOnClick?: (event: SyntheticEvent<HTMLButtonElement>) => void | Promise<void>
    }) => <button onClick={buttonOnClick}>{buttonText}</button>,
}))

const BOOKCLUB_ID = '1'

const members = [
    {user_id: '1', user_role: 1, bookclub_id: BOOKCLUB_ID, User: {id: '1', name: 'Pekka'}},
    {user_id: '2', user_role: 0, bookclub_id: BOOKCLUB_ID, User: {id: '2', name: 'Liisa'}},
]

describe('BookclubPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockUseParams.mockReturnValue({bookclubId: BOOKCLUB_ID})
        vi.mocked(bookclubmembersService.get).mockResolvedValue([])
        vi.mocked(bookclubmembersService.getByClubId).mockResolvedValue([])
    })

    it('redirects to /home when the bookclub id is missing', () => {
        mockUseParams.mockReturnValue({})

        const {container} = render(<BookclubPage/>)

        expect(mockNavigate).toHaveBeenCalledWith('/home')
        expect(container).toBeEmptyDOMElement()
    })

    it('renders the proposal phase with the suggest-book form', async () => {
        vi.mocked(cycleService.getLatestCycle).mockResolvedValue({
            id: 1,
            phase: 'proposal',
        } as any)

        render(<BookclubPage/>)

        await waitFor(() => {
            expect(screen.getByText(`Bookclub details for ${BOOKCLUB_ID}`)).toBeInTheDocument()
            expect(screen.getByText('Suggest a book')).toBeInTheDocument()
            expect(screen.getByText('Book list')).toBeInTheDocument()
        })
    })

    it('renders the voting phase without the suggest-book form', async () => {
        vi.mocked(cycleService.getLatestCycle).mockResolvedValue({
            id: 2,
            phase: 'voting',
        } as any)

        render(<BookclubPage/>)

        await waitFor(() => expect(screen.getByText('Book list')).toBeInTheDocument())
        expect(screen.queryByText('Suggest a book')).not.toBeInTheDocument()
    })

    it('renders the results phase without the suggest-book form', async () => {
        vi.mocked(cycleService.getLatestCycle).mockResolvedValue({
            id: 3,
            phase: 'over',
        } as any)

        render(<BookclubPage/>)

        await waitFor(() => expect(screen.getByText('Book list')).toBeInTheDocument())
        expect(screen.queryByText('Suggest a book')).not.toBeInTheDocument()
    })

    it('reloads the book list when a book is added', async () => {
        vi.mocked(cycleService.getLatestCycle).mockResolvedValue({
            id: 1,
            phase: 'proposal',
        } as any)

        const user = userEvent.setup()
        render(<BookclubPage/>)

        await user.click(
            await screen.findByRole('button', {name: 'Trigger book added'}),
        )

        await waitFor(() => expect(mockReload).toHaveBeenCalledTimes(1))
    })

    it('lists members of the club after switching to the Members tab', async () => {
        vi.mocked(cycleService.getLatestCycle).mockResolvedValue({
            id: 1,
            phase: 'proposal',
        } as any)
        vi.mocked(bookclubmembersService.getByClubId).mockResolvedValue(members as any)

        const user = userEvent.setup()
        render(<BookclubPage/>)

        await user.click(screen.getByRole('tab', {name: 'Members'}))

        await waitFor(() => {
            expect(screen.getByText('Club Members')).toBeInTheDocument()
            expect(screen.getByText('Pekka')).toBeInTheDocument()
            expect(screen.getByText('Liisa')).toBeInTheDocument()
        })
        expect(screen.queryByText('Toni')).not.toBeInTheDocument()
    })

    it('renders the History tab when selected', async () => {
        vi.mocked(cycleService.getLatestCycle).mockResolvedValue({
            id: 1,
            phase: 'proposal',
        } as any)

        const user = userEvent.setup()
        render(<BookclubPage/>)

        await user.click(screen.getByRole('tab', {name: 'History'}))

        expect(await screen.findByText('Cycle history')).toBeInTheDocument()
    })

    it('renders the Settings tab when selected', async () => {
        vi.mocked(cycleService.getLatestCycle).mockResolvedValue({
            id: 1,
            phase: 'proposal',
        } as any)
        vi.mocked(bookclubmembersService.get).mockResolvedValue([
            {bookclub_id: BOOKCLUB_ID, user_role: 0}
        ] as any)

        const user = userEvent.setup()
        render(<BookclubPage/>)

        await user.click(screen.getByRole('tab', {name: 'Settings'}))

        expect(screen.getByText('Manage Club')).toBeInTheDocument()
        expect(screen.getByText('Manage Cycle')).toBeInTheDocument()
        expect(screen.getByText('Manage cycle')).toBeInTheDocument()
        expect(screen.getByText('Manage Members')).toBeInTheDocument()
        expect(screen.getByText('Delete club')).toBeInTheDocument()
    })

    it('handles failure when loading the latest cycle', async () => {
        vi.mocked(cycleService.getLatestCycle).mockRejectedValue(new Error('cycle failed'))

        const user = userEvent.setup()
        render(<BookclubPage/>)

        // Ensure the Home tab is active so HomeTab mounts and its effect runs
        await user.click(screen.getByRole('tab', {name: 'Home'}))

        await waitFor(() => {
            expect(cycleService.getLatestCycle).toHaveBeenCalledWith(BOOKCLUB_ID)
            expect(mockShowError).toHaveBeenCalledWith('cycle failed')
        })
    })

    it('handles failure when checking admin status', async () => {
        vi.mocked(cycleService.getLatestCycle).mockResolvedValue({
            id: 1,
            phase: 'proposal',
        } as any)
        vi.mocked(bookclubmembersService.get).mockRejectedValue(new Error('admin check failed'))

        render(<BookclubPage/>)

        await waitFor(() => {
            expect(mockShowError).toHaveBeenCalledWith('Failed to check admin status: admin check failed')
        })
    })

    it('deletes the club and navigates home when confirmed', async () => {
        vi.mocked(cycleService.getLatestCycle).mockResolvedValue({
            id: 1,
            phase: 'proposal',
        } as any)
        vi.mocked(bookclubmembersService.get).mockResolvedValue([
            {bookclub_id: BOOKCLUB_ID, user_role: 0},
        ] as any)
        vi.mocked(bookclubService.remove).mockResolvedValue(undefined as any)

        const user = userEvent.setup()
        render(<BookclubPage/>)

        await user.click(screen.getByRole('tab', {name: 'Settings'}))
        await screen.findByText('Manage Club')
        await user.click(await screen.findByRole('button', {name: 'Delete club'}))

        await waitFor(() => {
            expect(bookclubService.remove).toHaveBeenCalledWith(BOOKCLUB_ID)
            expect(mockNavigate).toHaveBeenCalledWith('/home', {replace: true})
        })
    })

    it('shows an error when deleting the club fails', async () => {
        vi.mocked(cycleService.getLatestCycle).mockResolvedValue({
            id: 1,
            phase: 'proposal',
        } as any)
        vi.mocked(bookclubmembersService.get).mockResolvedValue([
            {bookclub_id: BOOKCLUB_ID, user_role: 0},
        ] as any)
        vi.mocked(bookclubService.remove).mockRejectedValue(new Error('delete failed'))

        const user = userEvent.setup()
        render(<BookclubPage/>)

        await user.click(screen.getByRole('tab', {name: 'Settings'}))
        await screen.findByText('Manage Club')
        await user.click(await screen.findByRole('button', {name: 'Delete club'}))

        await waitFor(() => {
            expect(bookclubService.remove).toHaveBeenCalledWith(BOOKCLUB_ID)
            expect(mockShowError).toHaveBeenCalledWith('Failed to delete club: delete failed')
        })
    })
})