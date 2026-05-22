import axios from 'axios'
const baseUrl = '/api/login'

type LoginCredentials = {
  email: string
  password: string
}

type User = {
  token: string
  email: string
  name: string
}

const login = async (
  credentials: LoginCredentials
): Promise<User> => {
  const response = await axios.post<User>(baseUrl, credentials)

  return response.data
}

//const login = async (
//  credentials: LoginCredentials
//): Promise<User> => {
//  await new Promise((resolve) => setTimeout(resolve, 500))
//
//  return {
//    token: 'fake-token',
//    email: credentials.email,
//    name: 'Test User'
//  }
//}
export default { login }
