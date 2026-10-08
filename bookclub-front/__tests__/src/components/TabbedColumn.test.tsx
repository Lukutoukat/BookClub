import {describe, it, expect, afterEach} from 'vitest'
import {render, screen, cleanup} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter, useSearchParams} from 'react-router-dom'
import '@testing-library/jest-dom/vitest'
import {TabbedColumn, type Tab} from "@/components/TabbedColumn.tsx";// adjust path if needed

const tabs: Tab[] = [
    {id: 'home', label: 'Home', content: <div>Content Home</div>},
    {id: 'members', label: 'Members', content: <div>Content Members</div>},
    {id: 'settings', label: 'Settings', content: <div>Content Settings</div>},
]

// Helper component to get tab search param
const SearchParamDisplay = () => {
    const [params] = useSearchParams()
    return <div data-testid="search-param">{params.get('tab')}</div>
}

const renderComponent = (initialEntries = ['/']) => {
    return render(
        <MemoryRouter initialEntries={initialEntries}>
            <TabbedColumn tabs={tabs}/>
            <SearchParamDisplay/>
        </MemoryRouter>
    )
}

afterEach(cleanup)

describe('TabbedColumn', () => {
    it('renders all tab labels', () => {
        renderComponent()
        expect(screen.getByText('Home')).toBeInTheDocument()
        expect(screen.getByText('Members')).toBeInTheDocument()
        expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('displays first tab content by default and hides others', () => {
        renderComponent()
        expect(screen.getByText('Content Home')).toBeVisible()
        expect(screen.queryByText('Content Members')).not.toBeInTheDocument()
        expect(screen.queryByText('Content Settings')).not.toBeInTheDocument()
    })

    it('switches tab on click and updates URL search param', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByText('Members'))

        expect(screen.getByText('Content Members')).toBeVisible()
        expect(screen.queryByText('Content Home')).not.toBeInTheDocument()
        expect(screen.getByTestId('search-param')).toHaveTextContent('members')
    })

    it('keeps previously visited tabs mounted (hidden) when switching back', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByText('Members'))
        expect(screen.getByText('Content Members')).toBeVisible()

        await user.click(screen.getByText('Home'))
        expect(screen.getByText('Content Home')).toBeVisible()

        const membersContent = screen.getByText('Content Members')
        expect(membersContent).toBeInTheDocument()
    })

    it('initializes active tab from URL search param', () => {
        renderComponent(['/?tab=settings'])
        expect(screen.getByText('Content Settings')).toBeVisible()
        expect(screen.queryByText('Content Home')).not.toBeInTheDocument()
    })
})