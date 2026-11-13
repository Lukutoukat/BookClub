
import { test, expect, type Page } from '@playwright/test'
import { randomUUID } from 'node:crypto'

const futureDateTime = (hoursFromNow: number) => {
    const date = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000)
    const pad = (value: number) => value.toString().padStart(2, '0')

    return [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate())
    ].join('-') + `T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const createUserAndOpenEvents = async (page: Page, suffix: string) => {
    const username = `e2e_user_${suffix}`
    const password = 'E2ePassword123'

    const registrationResponse = await page.request.post('/api/users', {
        data: {
            email: `${username}@example.com`,
            name: username,
            password
        }
    })
    expect(registrationResponse.ok()).toBe(true)

    const loginResponse = await page.request.post('/api/login', {
        data: { username, password }
    })
    expect(loginResponse.ok()).toBe(true)
    const { token } = await loginResponse.json() as { token: string }
    await page.goto('/login')
    await page.evaluate((loginToken) => {
        localStorage.setItem('loggedBookappToken', loginToken)
    }, token)
    await page.goto('/home')

    await page.goto('/create')
    await page.getByLabel('Name your book club').fill(`E2E Club ${suffix}`)
    await page.getByRole('button', { name: 'Create', exact: true }).click()
    await page.waitForURL('**/club/*')

    await page.getByRole('tab', { name: 'Events' }).click()
    await expect(page.getByText('No events yet.')).toBeVisible()
}

test('admin can create a meeting event', async ({ page }) => {
    const suffix = `${randomUUID()}_meeting`
    await createUserAndOpenEvents(page, suffix)

    await page.getByRole('button', { name: 'Create Event', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Event Name').fill('E2E Reading Circle')
    await dialog.getByLabel('Event Description').fill('A meeting created by an end-to-end test.')
    await dialog.getByLabel('Meeting Date').fill(futureDateTime(24))
    await dialog.getByRole('button', { name: 'Create Event', exact: true }).click()

    await expect(dialog).toBeHidden()
    await expect(page.getByRole('heading', { name: 'E2E Reading Circle' })).toBeVisible()
    await expect(page.getByText('A meeting created by an end-to-end test.')).toBeVisible()
    await expect(page.getByText('Meeting Date:')).toBeVisible()
})

test('admin can create a date poll event', async ({ page }) => {
    const suffix = `${randomUUID()}_poll`
    await createUserAndOpenEvents(page, suffix)

    await page.getByRole('button', { name: 'Create Event', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Event Name').fill('E2E Date Poll')
    await dialog.getByLabel('Create Date Poll').check()

    const dateInputs = dialog.locator('input[type="datetime-local"]')
    await dateInputs.nth(0).fill(futureDateTime(48))
    await dateInputs.nth(1).fill(futureDateTime(72))
    await dialog.getByLabel('Poll Ends At').fill(futureDateTime(24))
    await dialog.getByRole('button', { name: 'Create Event', exact: true }).click()

    await expect(dialog).toBeHidden()
    await expect(page.getByRole('heading', { name: 'E2E Date Poll' })).toBeVisible()
    await expect(page.getByText('Poll Ends At:')).toBeVisible()
})

test('admin cannot create a poll with an option before the poll end', async ({ page }) => {
    const suffix = `${randomUUID()}_invalid_poll`
    await createUserAndOpenEvents(page, suffix)

    await page.getByRole('button', { name: 'Create Event', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Event Name').fill('E2E Invalid Date Poll')
    await dialog.getByLabel('Create Date Poll').check()

    const dateInputs = dialog.locator('input[type="datetime-local"]')
    await dateInputs.nth(0).fill(futureDateTime(12))
    await dateInputs.nth(1).fill(futureDateTime(48))
    await dialog.getByLabel('Poll Ends At').fill(futureDateTime(24))

    await expect(dialog.getByText('Poll options must be after the poll end date.')).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Create Event', exact: true })).toBeDisabled()

    await dateInputs.nth(0).fill(futureDateTime(36))
    await expect(dialog.getByText('Poll options must be after the poll end date.')).toBeHidden()
    await expect(dialog.getByRole('button', { name: 'Create Event', exact: true })).toBeEnabled()
})

test('admin can add a third date poll option', async ({ page }) => {
    const suffix = `${randomUUID()}_three_options`
    await createUserAndOpenEvents(page, suffix)

    await page.getByRole('button', { name: 'Create Event', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Event Name').fill('E2E Three Option Poll')
    await dialog.getByLabel('Create Date Poll').check()
    await dialog.getByLabel('Add Option').click()

    const dateInputs = dialog.locator('input[type="datetime-local"]')
    await dateInputs.nth(0).fill(futureDateTime(48))
    await dateInputs.nth(1).fill(futureDateTime(72))
    await dateInputs.nth(2).fill(futureDateTime(96))
    await dialog.getByLabel('Poll Ends At').fill(futureDateTime(24))
    await dialog.getByRole('button', { name: 'Create Event', exact: true }).click()

    await expect(dialog).toBeHidden()
    await expect(page.getByRole('heading', { name: 'E2E Three Option Poll' })).toBeVisible()
})
