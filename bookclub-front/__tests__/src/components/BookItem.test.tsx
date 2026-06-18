import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BookItem from '@/components/BookItem'
import type { Book } from '@/services/books'
import type { VoteFields } from '@/services/vote'
import '@testing-library/jest-dom/vitest'

const mockBook = (overrides?: Partial<Book>): Book => ({
  id: '1',
  isbn: '9780451524935',
  name: 'Test Book',
  author: 'Author Name',
  year: 2024,
  pages: 300,
  comment: 'This is a test book.',
  language: 'English',
  genre: 'Fiction',
  proposal_id: 'proposal-1',
  ...overrides
})

describe('BookItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders book metadata and shows edit/delete when not readonly or voting', () => {
    const onDelete = vi.fn(async () => {})
    const onEdit = vi.fn()
    const onVote = vi.fn(async () => {})

    render(
      <BookItem
        book={mockBook()}
        onDelete={onDelete}
        onEdit={onEdit}
        isReadOnly={false}
        isVotingPhase={false}
        onVote={onVote}
      />
    )

    expect(screen.getByText('Test Book')).toBeInTheDocument()
    expect(screen.getByText('Author Name')).toBeInTheDocument()
    expect(screen.getByText('2024')).toBeInTheDocument()
    expect(screen.getByText('Fiction')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    expect(screen.getByTitle('Delete book')).toBeInTheDocument()
  })

  it('calls onEdit when Edit button is clicked', async () => {
    const onDelete = vi.fn(async () => {})
    const onEdit = vi.fn()
    const onVote = vi.fn(async () => {})
    const user = userEvent.setup()

    render(
      <BookItem
        book={mockBook()}
        onDelete={onDelete}
        onEdit={onEdit}
        isReadOnly={false}
        isVotingPhase={false}
        onVote={onVote}
      />
    )

    await user.click(screen.getByRole('button', { name: /edit/i }))

    expect(onEdit).toHaveBeenCalled()
  })

  it('expands and collapses book details when More/Less is clicked', async () => {
    const onDelete = vi.fn(async () => {})
    const onEdit = vi.fn()
    const onVote = vi.fn(async () => {})
    const user = userEvent.setup()

    render(
      <BookItem
        book={mockBook()}
        onDelete={onDelete}
        onEdit={onEdit}
        isReadOnly={false}
        isVotingPhase={false}
        onVote={onVote}
      />
    )

    const moreButton = screen.getByRole('button', { name: /more/i })
    await user.click(moreButton)

    expect(screen.getByText('This is a test book.')).toBeInTheDocument()
    expect(screen.getByText('Language')).toBeInTheDocument()
    expect(screen.getByText('Pages')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /less/i }))
    expect(screen.queryByText('This is a test book.')).toBeNull()
  })

  it('calls onDelete when delete dialog is confirmed', async () => {
    const onDelete = vi.fn(async () => {})
    const onEdit = vi.fn()
    const onVote = vi.fn(async () => {})
    const user = userEvent.setup()

    render(
      <BookItem
        book={mockBook()}
        onDelete={onDelete}
        onEdit={onEdit}
        isReadOnly={false}
        isVotingPhase={false}
        onVote={onVote}
      />
    )

    await user.click(screen.getByTitle('Delete book'))
    await user.click(screen.getByTitle('continue'))

    expect(onDelete).toHaveBeenCalledWith('1')
  })

  it('renders voting controls and calls onVote when a vote option is selected', async () => {
    const onDelete = vi.fn(async () => {})
    const onEdit = vi.fn()
    const onVote = vi.fn(async () => {})
    const user = userEvent.setup()
    const existingVote: VoteFields = { id: 'vote-1', proposal_id: 'proposal-1', weight: 2 }

    render(
      <BookItem
        book={mockBook()}
        onDelete={onDelete}
        onEdit={onEdit}
        isReadOnly={false}
        isVotingPhase={true}
        onVote={onVote}
        existingVote={existingVote}
      />
    )

    expect(screen.getByLabelText('Could read')).toBeChecked()

    await user.click(screen.getByLabelText('Want to read'))

    expect(onVote).toHaveBeenCalledWith('proposal-1', 3, 'vote-1')
  })
})
