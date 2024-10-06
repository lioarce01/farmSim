'use client';

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { User } from '../../types';

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3002/',
  }),

  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => 'users',
    }),

    getUserBySub: builder.query<User, string>({
      query: (sub) => `/users/${sub}`,
    }),

    registerUser: builder.mutation({
      query: (userData) => ({
        url: '/users/register',
        method: 'POST',
        body: userData,
      }),
    }),
    convertUser: builder.mutation({
      query: (body) => ({
        url: '/users/convert',
        method: 'PUT',
        body: body,
      }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useRegisterUserMutation,
  useConvertUserMutation,
  useGetUserBySubQuery,
} = usersApi;
