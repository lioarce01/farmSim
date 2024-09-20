import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store/store';
import { Seed, User } from '../../types'; // Asegúrate de que esta ruta sea correcta


export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:3002/',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`) 
      }
      return headers
    },
   }),

  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => 'users',
    })
  }),
});

export const { useGetUsersQuery } = api;