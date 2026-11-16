import { expect, type Page } from '@playwright/test'

const registerWith = async (page: Page, username: string, password: string) => {
    const res = await page.request.post('/api/users', {
        data: {
            email: `${username}@test.com`,
            name: username,
            password
        }
    })
    expect(res).toBeOK()
}

const loginWith = async (page: Page, username: string, password: string) => {
    const res = await page.request.post('/api/login', {
        data: { username, password }
    })
    expect(res).toBeOK()

    const { token } = await res.json() as { token: string }
    await page.addInitScript((t) => localStorage.setItem('loggedBookappToken', t), token)
    return token
}

const createClubWith = async (page: Page, name: string, token: string) => {
    const res = await page.request.post('/api/bookclubs', {
        data: { name },
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    expect(res).toBeOK()
    return res.json()
}

export {
    registerWith,
    loginWith,
    createClubWith,
}
