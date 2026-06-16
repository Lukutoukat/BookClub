import axios from 'axios';
import { getAuthConfig } from '@/services/auth';
import { type Book } from '@/services/books';

const baseUrl = '/api/propose';

export interface ProposeFields {
  id: string;
  book_id?: string;
  cycle_id?: string;
  bookclub_id?: string;
}

export type deletePropose = Omit<ProposeFields, 'id' | 'book_id' | 'cycle_id'>;
export type Propose = ProposeFields;
export type CreatePropose = Omit<ProposeFields, 'id'>;

const getAll = () => {
  return axios.get<Propose[]>(baseUrl).then((res) => res.data);
};

const getProposedBooks = (cycleId: string) => {
  return axios.post<Book[]>(`${baseUrl}/${cycleId}`, {}, getAuthConfig()).then((res) => res.data);
};

const removeProposedBook = (cycle_id: string, book_id: string) => {
  return axios
    .delete<deletePropose>(`${baseUrl}/${cycle_id}/${book_id}`, getAuthConfig())
    .then((res) => res.data);
};

const create = (propose: CreatePropose) => {
  return axios.post<Propose>(baseUrl, propose, getAuthConfig()).then((res) => res.data);
};

export default { getAll, getProposedBooks, create, removeProposedBook };
