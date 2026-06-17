import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import AccountSettings from '@/components/AccountSettings'

describe('AccountSettings', () => {
  it('calls handleLogOut when log out button is clicked', async () => {
    const user = userEvent.setup()
    const handleLogOut = vi.fn()

    render(<AccountSettings handleLogOut={handleLogOut} />)

    await user.click(screen.getByRole('button', { name: /log out/i }))

    expect(handleLogOut).toHaveBeenCalledTimes(1)
  })
})
