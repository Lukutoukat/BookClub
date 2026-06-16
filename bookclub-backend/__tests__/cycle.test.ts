/// <reference types="jest" />

import request from 'supertest';
import jwt from 'jsonwebtoken';

jest.mock('../db.ts', () => ({
	prisma: {
		bookClubMembers: {
			findFirst: jest.fn(),
		},
		cycle: {
			create: jest.fn(),
			findMany: jest.fn(),
			findUnique: jest.fn(),
		},
		user: {
			findUnique: jest.fn(),
		},
	},
}));

import { app } from '../index.ts';
import { prisma } from '../db.ts';

const authHeaders = () => {
	if (!process.env.SECRET) {
		process.env.SECRET = 'testsecret';
	}

	return {
		Authorization: `Bearer ${jwt.sign({ id: '1' }, process.env.SECRET)}`,
	};
};

describe('/api/cycles', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.spyOn(console, 'error').mockImplementation(() => {});
		process.env.SECRET = 'testsecret';
		(prisma.user.findUnique as jest.Mock).mockResolvedValue({
			id: '1',
			email: 'matti@test.com',
			name: 'matti',
		});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	const mockCycle = {
		bookclub_id: '1',
		proposalEnd: '2026-06-30',
		votingEnd: '2026-07-01',
	};

	describe('POST', () => {
		it('creates cycles', async () => {
			(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
				user_role: 0,
			});
			(prisma.cycle.create as jest.Mock).mockResolvedValue(mockCycle);

			const response = await request(app).post('/api/cycles').set(authHeaders()).send(mockCycle);

			expect(prisma.cycle.create).toHaveBeenCalledTimes(1);
			expect(prisma.cycle.create).toHaveBeenCalledWith({
				data: {
					bookclub_id: '1',
					proposalEnd: '2026-06-30',
					votingEnd: '2026-07-01',
				},
			});

			expect(response.status).toBe(200);
			expect(response.body).toEqual(mockCycle);
		});

		it('returns 500 if create fails', async () => {
			(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
				user_role: 0,
			});
			(prisma.cycle.create as jest.Mock).mockRejectedValue(new Error('Database failed'));

			const response = await request(app).post('/api/cycles').set(authHeaders()).send(mockCycle);

			expect(prisma.cycle.create).toHaveBeenCalledTimes(1);

			expect(response.status).toBe(500);
			expect(response.body).toEqual({
				error: 'database error',
			});
		});

		it('returns 400 if user is not a member of book club', async () => {
			(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue(null);

			const response = await request(app).post('/api/cycles').set(authHeaders()).send({
				bookclub_id: '2',
			});

			expect(prisma.bookClubMembers.findFirst).toHaveBeenCalledTimes(1);
			expect(prisma.bookClubMembers.findFirst).toHaveBeenCalledWith({
				where: {
					bookclub_id: '2',
					user_id: '1',
				},
				select: { user_role: true },
			});

			expect(response.status).toBe(400);
			expect(response.body).toEqual({
				error: 'User is not member of book club!',
			});
		});

		it('returns 403 if user is not admin of book club', async () => {
			(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
				user_role: 1,
			});
			(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
				user_role: 1,
			});

			const response = await request(app).post('/api/cycles').set(authHeaders()).send({
				bookclub_id: '3',
			});

			expect(prisma.bookClubMembers.findFirst).toHaveBeenCalledTimes(1);
			expect(prisma.bookClubMembers.findFirst).toHaveBeenCalledWith({
				where: {
					bookclub_id: '3',
					user_id: '1',
				},
				select: { user_role: true },
			});

			expect(response.status).toBe(403);
			expect(response.body).toEqual({
				error: 'User is not admin of book club!',
			});
		});
	});

	describe('GET', () => {
		it('returns cycles', async () => {
			const mockcycle = {
				id: '1',
				bookclub_id: '1',
				createdAt: '2026-06-11T13:17:37.803Z',
				proposalEnd: '2026-06-25T13:17:35.775Z',
				votingEnd: '2026-07-09T13:17:35.776Z',
			};

			(prisma.cycle.findMany as jest.Mock).mockResolvedValue(mockcycle);

			const response = await request(app).get('/api/cycles');

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				id: '1',
				bookclub_id: '1',
				createdAt: '2026-06-11T13:17:37.803Z',
				proposalEnd: '2026-06-25T13:17:35.775Z',
				votingEnd: '2026-07-09T13:17:35.776Z',
			});
			expect(prisma.cycle.findMany).toHaveBeenCalledTimes(1);
		});

		it('returns 500 if get all fails', async () => {
			(prisma.cycle.findMany as jest.Mock).mockRejectedValue(new Error('Database failed'));

			const response = await request(app).get('/api/cycles');

			expect(response.status).toBe(500);
			expect(response.body).toEqual({ error: 'database error' });
		});
	});

	// describe('PUT', () => {
	//     it('changes the cycle phase', async () => {
	//         const mockcycle = {
	//             id: "1",
	//             bookclub_id: "1",
	//             createdAt: "2026-06-11T13:17:37.803Z",
	//             proposalEnd: "2026-06-25T13:17:35.775Z",
	//             votingEnd: "2026-07-09T13:17:35.776Z"
	//         }
	//         const editedMock = {
	//             proposalEnd: "2026-06-25T13:17:35.775Z"
	//         }
	//         ;(prisma.cycle.findUnique as jest.Mock).mockResolvedValue(mockcycle)
	//         ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
	//             user_role: 0,
	//         })

	//         const response = await request(app).put('/api/cycles/1')
	//             .set(authHeaders())
	//             .send(editedMock)

	//         expect(response.status).toBe(200)
	//         expect(response.body).toEqual(mockcycle)
	//         expect(prisma.cycle.update).toHaveBeenCalledTimes(1)
	//         expect(prisma.cycle.update).toHaveBeenCalledWith({
	//             where: { id: "1" },
	//             data: {
	//                 proposalEnd: "2026-06-25T13:17:35.775Z"
	//             }
	//         })
	//     })
	// })
});
