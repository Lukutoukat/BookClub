import {prisma} from "../../db.ts";
import bcrypt from 'bcrypt'
import {userCreationRequestSchema as schema, isExistingUser, registerUser} from '../../services/userService.ts'

jest.mock('../../db.ts', () => ({prisma: {user: {findFirst: jest.fn(), create: jest.fn()}}}))
jest.mock('bcrypt')

const user = {email: 'a@b.com', name: 'Alice', password: 'secret1'}
const findFirst = prisma.user.findFirst as jest.Mock
const create = prisma.user.create as jest.Mock

describe('userService', () => {
    beforeEach(() => jest.clearAllMocks())

    test('schema succeeds with valid input', () => {
        expect(schema.safeParse(user).success).toBe(true)
    })

    test('schema fails with incomplete inputs', () => {
        for (const k of Object.keys(user)) {
            expect(schema.safeParse({...user, [k]: null}).success).toBe(false)
        }
        expect(schema.safeParse({}).success).toBe(false)
        expect(schema.safeParse(null).success).toBe(false)
    })

    test('isExistingUser reflects db result', async () => {
        findFirst.mockResolvedValue({id: 1})
        expect(await isExistingUser(user.email, user.name)).toBe(true)

        findFirst.mockResolvedValue(null)
        expect(await isExistingUser(user.email, user.name)).toBe(false)
    })

    test('isExistingUser returns true if database fails', async () => {
        findFirst.mockRejectedValueOnce(new Error('Database error'))
        expect(await isExistingUser(user.email, user.name)).toBe(true)
    })

    test('registerUser hashes password and returns id', async () => {
        ;(bcrypt.hash as jest.Mock).mockResolvedValue('HASH')
        create.mockResolvedValue({id: 1})

        const result = await registerUser(user.email, user.name, user.password)
        expect(result.id).toEqual(1)

        const {data} = create.mock.calls[0][0]
        expect(data).toMatchObject({
            email: user.email,
            name: user.name,
            password_hash: 'HASH'
        })
        expect(data.password_hash).not.toBe(user.password)
    })
})