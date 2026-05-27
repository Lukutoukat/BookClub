import axios from 'axios'
const baseUrl = '/api/login'

type LoginCredentials = {
  username: string
  password: string
}

// type User = {
//   username: string
// }

const login = async (
  credentials: LoginCredentials
): Promise<LoginCredentials> => {
  const response = await axios.post<LoginCredentials>(baseUrl, credentials)

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
