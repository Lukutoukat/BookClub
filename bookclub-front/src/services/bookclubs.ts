import axios from "axios";
import { getAuthConfig } from "./auth";
const baseUrl = "/api/bookclubs";

export interface BookClubFields {
  id: string;
  name: string;
  owner_id: string;
}

export type BookClub = BookClubFields;
export type CreateBookClub = Omit<BookClubFields, "id">;

const create = async (newBookClub: CreateBookClub) => {
  return await axios
    .post<BookClub>(baseUrl, newBookClub, getAuthConfig())
    .then((res) => res.data);
};

const getAll = () => {
  return axios.get<BookClub[]>(baseUrl).then((res) => res.data);
};

const get = (clubIds: string[]): Promise<BookClub[]> => {
  return axios
    .get<BookClub[]>(baseUrl, {
      ...getAuthConfig(),
      params: { clubIds },
      paramsSerializer: {
        indexes: null,
      },
    })
    .then((res) => res.data);
};

const remove = (id: number) => {
  return axios.delete(`${baseUrl}/${id}`, getAuthConfig());
};
export default {
  create,
  getAll,
  get,
  remove,
};
