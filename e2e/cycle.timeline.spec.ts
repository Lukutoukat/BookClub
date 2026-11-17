import { test, expect, Page } from '@playwright/test';
import { registerWith, loginWith, createClubWith } from './helper';
import { randomUUID } from 'node:crypto'

const gotoManageCycle = async (page: Page) => {
    await page.getByRole('tab', { name: 'Settings' }).click()
    await page.getByRole('link', { name: 'Manage cycle' }).click()
    await page.waitForURL('**/newcycle/*')
}

test.describe('cycle progress timeline', () => {
    let clubId: string

    test.beforeEach(async ({ page }) => {
        const suffix = randomUUID()
        
        const username = `user_${suffix}`
        const password = 'E2ePassword123'
        const clubName = `CycleProgressTest_${suffix}`

        await registerWith(page, username, password)
        const token = await loginWith(page, username, password)
        
        const club = await createClubWith(page, clubName, token)
        clubId = club.id
    })

    test('new cycle information is displayed on club home page', async ({ page }) => {
        await page.goto(`/club/${clubId}`)

        await gotoManageCycle(page)
        await page.getByRole('button', { name: 'Create' }).click()

        const card = page.getByTestId('progress-card')
        await expect(card.getByText('Current Cycle')).toBeVisible()
        await expect(card.getByText('Current Phase')).toBeVisible()
        await expect(card.getByText('Suggest Books')).toBeVisible()
        await expect(card.getByText('Suggest which book should be read next')).toBeVisible()
        await expect(card.getByText('Time Left')).toBeVisible()
        await expect(card.getByText('13', { exact: true })).toBeVisible()
        await expect(card.getByText('Next phase: Voting', { exact: true })).toBeVisible()
        await expect(card.getByText('Suggestions')).toBeVisible()
        await expect(card.getByText('Voting', { exact: true })).toBeVisible()
        await expect(card.getByText('Results')).toBeVisible()
    })

    test('cycle information updates when moving to anothor phase', async ({ page }) => {
        await page.goto(`/club/${clubId}`)

        await gotoManageCycle(page)
        await page.getByRole('button', { name: 'Create' }).click()

        await gotoManageCycle(page)
        await page.getByRole('button', { name: 'End current phase' }).click()
        await page.getByRole('button', { name: 'Continue' }).click()


        const card = page.getByTestId('progress-card')
        await expect(card.getByText('Vote Books')).toBeVisible()
        await expect(card.getByText('27', { exact: true })).toBeVisible()
        await expect(card.getByText('Vote which books you\'d like to read')).toBeVisible()
        await expect(card.getByText('Next phase: Results', { exact: true })).toBeVisible()

        await gotoManageCycle(page)
        await page.getByRole('button', { name: 'End current phase' }).click()
        await page.getByRole('button', { name: 'Continue' }).click()

        await expect(card.getByText('Voting Results')).toBeVisible()
        await expect(card.getByText('Check the results of the vote below')).toBeVisible()
    })
})
