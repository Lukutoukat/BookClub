/// <reference types="jest" />
import request from 'supertest'

jest.mock('../db.ts')
jest.mock('../services/userService.ts', () => ({
    ...jest.requireActual('../services/userService.ts'),
    isExistingUser: jest.fn(),
    registerUser: jest.fn(),
}))

import { app } from '../index.ts'
import * as userService from '../services/userService.ts'

const isExistingUser = userService.isExistingUser as jest.Mock
const registerUser = userService.registerUser as jest.Mock

const validUser = {email: 'a@b.com', name: 'Alice', password: 'secret1'}

describe('POST /api/users', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        isExistingUser.mockResolvedValue(false)
        registerUser.mockResolvedValue({id: 1})
    })

    it('creates a user and returns only the id', async () => {
        const res = await request(app).post('/api/users').send(validUser)

        expect(res.status).toBe(200)
        expect(res.body).toEqual({id: 1})
    })

    it('calls the services with validated body', async () => {
        await request(app).post('/api/users').send(validUser)

        expect(isExistingUser).toHaveBeenCalledWith(validUser.email, validUser.name)
        expect(registerUser).toHaveBeenCalledWith(validUser.email, validUser.name, validUser.password)
    })

    it('rejects a duplicate user', async () => {
        isExistingUser.mockResolvedValue(true)

        const res = await request(app).post('/api/users').send(validUser)

        expect(res.status).toBe(400)
        expect(res.body).toEqual({error: 'existing_user'})
        expect(registerUser).not.toHaveBeenCalled()
    })

    it.each([
        ['invalid email', {...validUser, email: 'nope'}],
        ['short password', {...validUser, password: 'x'}],
        ['missing name', {...validUser, name: undefined}],
    ])('rejects %s before touching any service', async (_label, body) => {
        const res = await request(app).post('/api/users').send(body)

        expect(res.status).toBe(400)
        expect(isExistingUser).not.toHaveBeenCalled()
        expect(registerUser).not.toHaveBeenCalled()
    })
})