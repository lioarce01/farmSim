import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store/store';
import { User } from '../../types'; // Asegúrate de que esta ruta sea correcta

type UserTag = { type: 'User'; sub: string }

export const usersApi = createApi({
  reducerPath: 'usersApi',
  tagTypes: ['User'],
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:3002/',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`) 
      }
      return headers
    },
   }),

  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => 'users',
    }),

    getUserBySub: builder.query<User, string>({
      query: (sub) => `/users/${sub}`,
      providesTags: (result, error, sub) => [{ type: 'User', sub: sub }]
    }),

    registerUser: builder.mutation({
      query: (userData) => ({
        url: '/users/register',
        method: 'POST',
        body: userData,
      }),
    }),
  }),
});

export const { useGetUsersQuery, useRegisterUserMutation, useGetUserBySubQuery } = usersApi