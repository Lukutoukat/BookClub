import axios from 'axios'
import { test, expect, vi, describe, beforeEach, afterEach } from 'vitest'
import type { Mocked } from 'vitest'
import cycle from '@/services/cycle'

vi.mock('axios')

const mockedAxios = axios as Mocked<typeof axios>

const mockCycle = {
	id: "1",
	bookclub_id: "bookclub_1"
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-01-10T00:00:00Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

test('getAll returns all cycles', async () => {
	const mockCycles = [mockCycle]

	mockedAxios.get.mockResolvedValue({
		data: mockCycles,
	})

	const result = await cycle.getAll()

	expect(result).toEqual(mockCycles)
})

describe('getLatestCycle returns the latest cycle', () => {
	test('returns proposal phase when proposalEnd is in the future', async () => {
		const mockCycleWithDates = {
			...mockCycle,
			proposalEnd: "2026-01-20T00:00:00Z",
			votingEnd: "2026-01-30T00:00:00Z",
		}
		
		mockedAxios.get.mockResolvedValue({
			data: mockCycleWithDates,
		})

		const result = await cycle.getLatestCycle(mockCycle.bookclub_id)

		expect(result).toEqual({
			...mockCycleWithDates,
			phase: 'proposal',
		})

	})

	test('returns voting phase when proposalEnd is in the past and votingEnd is in the future', async () => {
		const mockCycleWithDates = {
			...mockCycle,
			proposalEnd: "2026-01-01T00:00:00Z",
			votingEnd: "2026-01-30T00:00:00Z",
		}
		
		mockedAxios.get.mockResolvedValue({
			data: mockCycleWithDates,
		})

		const result = await cycle.getLatestCycle(mockCycle.bookclub_id)

		expect(result).toEqual({
			...mockCycleWithDates,
			phase: 'voting',
		})

	})

	test('returns over phase when votingEnd is in the past', async () => {
		const mockCycleWithDates = {
			...mockCycle,
			proposalEnd: "2026-01-01T00:00:00Z",
			votingEnd: "2026-01-05T00:00:00Z",
		}
		
		mockedAxios.get.mockResolvedValue({
			data: mockCycleWithDates,
		})

		const result = await cycle.getLatestCycle(mockCycle.bookclub_id)

		expect(result).toEqual({
			...mockCycleWithDates,
			phase: 'over',
		})

	})
})


test('create returns created cycle', async () => {
	mockedAxios.post.mockResolvedValue({
		data: mockCycle,
	})

	const result = await cycle.create(mockCycle)

	expect(result).toEqual(mockCycle)
})