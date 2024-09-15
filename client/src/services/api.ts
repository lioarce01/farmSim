import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Seed, User } from '../types'; // Asegúrate de que esta ruta sea correcta

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3002/' }),
  endpoints: (builder) => ({
    getSeeds: builder.query<Seed[], void>({
      query: () => 'seeds',
    }),
    getUsers: builder.query<User[], void>({
      query: () => 'users',
    })
  }),
});

export const { useGetSeedsQuery, useGetUsersQuery } = api;