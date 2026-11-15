import React from 'react'
import {render, screen} from '@testing-library/react'
import user from '@testing-library/user-event'
import {describe, test, expect, vi, beforeEach} from 'vitest'
import BookCreationDialog from '@/components/book/BookCreationDialog.tsx'

vi.mock('react-i18next', () => ({
    useTranslation: () => ({t: (key: string) => key}),
}))

vi.mock('@/services/books.ts', () => ({
    toGeneric: (b: any) => b,
}))

const DialogCtx = React.createContext<{ open: boolean; setOpen: (v: boolean) => void }>({
    open: false,
    setOpen: () => {
    },
})

vi.mock('@/components/ui/dialog.tsx', () => ({
    Dialog: ({open, onOpenChange, children}: any) => (
        <DialogCtx.Provider value={{open, setOpen: onOpenChange}}>{children}</DialogCtx.Provider>
    ),
    DialogTrigger: ({children}: any) => {
        const {setOpen} = React.useContext(DialogCtx)
        return React.cloneElement(children, {onClick: () => setOpen(true)})
    },
    DialogContent: ({children}: any) => {
        const {open} = React.useContext(DialogCtx)
        return open ? <div data-testid="dialog-content">{children}</div> : null
    },
    DialogHeader: ({children}: any) => <div>{children}</div>,
    DialogTitle: ({children}: any) => <div>{children}</div>,
    DialogFooter: ({children}: any) => <div>{children}</div>,
    DialogClose: ({children}: any) => {
        const {setOpen} = React.useContext(DialogCtx)
        return React.cloneElement(children, {onClick: () => setOpen(false)})
    },
}))

vi.mock('@/components/ui/toggle-group.tsx', () => ({
    ToggleGroup: ({onValueChange, children}: any) => (
        <div data-testid="toggle-group">
            {React.Children.map(children, (child: any) =>
                React.cloneElement(child, {onClick: () => onValueChange(child.props.value)})
            )}
        </div>
    ),
    ToggleGroupItem: ({children, onClick}: any) => (
        <button data-testid={`tab-${children}`} onClick={onClick}>
            {children}
        </button>
    ),
}))

vi.mock('@/components/book/HelmetBookSearch', () => ({
    default: ({onSelectBook}: any) => (
        <button data-testid="helmet-search" onClick={() => onSelectBook({id: 'h1', name: 'Helmet Book'})}>
            pick-helmet-book
        </button>
    ),
}))

vi.mock('@/components/BookForm', () => ({
    default: ({onBookAdded}: any) => (
        <button data-testid="manual-form" onClick={() => onBookAdded({name: 'Manual Book', author: 'A'})}>
            submit-manual
        </button>
    ),
}))

describe('BookCreationDialog', () => {
    beforeEach(() => vi.clearAllMocks())

    const setup = () => {
        const onSelectBook = vi.fn()
        render(
            <BookCreationDialog
                DialogButton={<button data-testid="open-dialog">Open</button>}
                onSelectBook={onSelectBook}
            />
        )
        return {onSelectBook, us: user.setup()}
    }

    test('renders the trigger button', () => {
        setup()
        expect(screen.getByTestId('open-dialog')).toBeDefined()
    })

    test('opens the dialog when trigger is clicked', async () => {
        const {us} = setup()
        await us.click(screen.getByTestId('open-dialog'))
        expect(screen.getByText('books.dialog.title')).toBeDefined()
    })

    test('defaults to helmet tab and shows HelmetBookSearch', async () => {
        const {us} = setup()
        await us.click(screen.getByTestId('open-dialog'))
        expect(screen.getByTestId('helmet-search')).toBeDefined()
        expect(screen.queryByTestId('manual-form')).toBeNull()
    })

    test('switches to manual tab and shows BookForm', async () => {
        const {us} = setup()
        await us.click(screen.getByTestId('open-dialog'))
        await us.click(screen.getByTestId('tab-books.dialog.manual.tab'))
        expect(screen.getByTestId('manual-form')).toBeDefined()
        expect(screen.queryByTestId('helmet-search')).toBeNull()
    })

    test('selecting a helmet book invokes onSelectBook and closes the dialog', async () => {
        const {onSelectBook, us} = setup()
        await us.click(screen.getByTestId('open-dialog'))
        await us.click(screen.getByTestId('helmet-search'))

        expect(onSelectBook).toHaveBeenCalledWith({id: 'h1', name: 'Helmet Book'})
        expect(screen.queryByTestId('dialog-content')).toBeNull()
    })

    test('submitting the manual form invokes onSelectBook with a generated id and closes', async () => {
        const {onSelectBook, us} = setup()
        await us.click(screen.getByTestId('open-dialog'))
        await us.click(screen.getByTestId('tab-books.dialog.manual.tab'))
        await us.click(screen.getByTestId('manual-form'))

        expect(onSelectBook).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Manual Book',
                author: 'A',
                id: expect.any(String),
            })
        )
        expect(screen.queryByTestId('dialog-content')).toBeNull()
    })

    test('cancel closes the dialog', async () => {
        const {us} = setup()
        await us.click(screen.getByTestId('open-dialog'))
        expect(screen.getByTestId('dialog-content')).toBeDefined()

        await us.click(screen.getByText('Cancel'))
        expect(screen.queryByTestId('dialog-content')).toBeNull()
    })
})