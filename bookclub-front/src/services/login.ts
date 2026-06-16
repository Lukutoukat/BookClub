import axios from 'axios';
const baseUrl = '/api/login';

type LoginCredentials = {
  username: string;
  password: string;
};

export type userWithToken = {
  email: string;
  name: string;
  token: string;
};

// type User = {
//   username: string
// }

const login = async (credentials: LoginCredentials): Promise<userWithToken> => {
  const response = await axios.post<userWithToken>(baseUrl, credentials);

  return response.data;
};

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
export default { login };
