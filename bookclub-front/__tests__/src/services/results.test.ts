import axios from 'axios'
import { test, expect, vi } from 'vitest'
import type { Mocked } from 'vitest'
import results from '@/services/results'

vi.mock('axios')

const mockedAxios = axios as Mocked<typeof axios>

const mockBookResult = {
	isbn: "1234567890",
	name: "Book 1",
	author: "Author 1",
	year: 1,
	pages: 100,
	comment: "Comment 1",
	language: "Language 1",
	genre: "Genre 1",
	proposal_id: "proposal_1",
	cycle_id: "cycle_1",
	score: 3
}

test('getResults returns results in the cycle', async () => {
	const mockBookResults = [mockBookResult]

	mockedAxios.get.mockResolvedValue({
		data: mockBookResults,
	})

	await results.getResults(mockBookResult.cycle_id)

	expect(mockedAxios.get).toHaveBeenCalledWith(
		`/api/results/${mockBookResult.cycle_id}`,
		expect.objectContaining({
			headers: expect.objectContaining({
				Authorization: null,
			}),
		}),
	)
})