import {render, screen, waitFor} from '@/utils/test-utils'
import {describe, expect, it, vi, beforeEach} from 'vitest'
import userEvent from '@testing-library/user-event'
import {forwardRef, useImperativeHandle, type Ref} from 'react'

import BookclubPage from '@/pages/BookclubPage'
import cycleService from '@/services/cycle'
import bookclubmembersService from '@/services/bookclubmembers'

const {mockReload} = vi.hoisted(() => ({
    mockReload: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
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
    default: () => <div>Cycle settings</div>,
}))

vi.mock('@/components/CycleHistoryList', () => ({
    default: () => <div>Cycle history</div>,
}))

vi.mock('@/components/ButtonDialog', () => ({
    ButtonDialog: ({buttonText}: { buttonText: string }) => <div>{buttonText}</div>,
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

    it('logs the error and renders no cycle content when getLatestCycle rejects', async () => {
        const error = new Error('network down')
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {
        })

        vi.mocked(cycleService.getLatestCycle).mockRejectedValue(error)

        render(<BookclubPage/>)

        await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith(error))
        expect(screen.queryByText('Suggest a book')).not.toBeInTheDocument()
        expect(screen.queryByText('Book list')).not.toBeInTheDocument()

        consoleSpy.mockRestore()
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

        const user = userEvent.setup()
        render(<BookclubPage/>)

        await user.click(screen.getByRole('tab', {name: 'Settings'}))

        expect(await screen.findByText('Cycle settings')).toBeInTheDocument()
        expect(screen.getByText('Manage Members')).toBeInTheDocument()
        expect(screen.getByText('Manage Club')).toBeInTheDocument()
        expect(screen.getByText('Delete club')).toBeInTheDocument()
    })
})