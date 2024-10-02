'use client'

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store/store';
import { User } from '../../types'; 

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:3002/',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`) 
      } else {
        console.warn('Intentando hacer una solicitud sin un token')
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

export const { useGetUsersQuery, useRegisterUserMutation, useConvertUserMutation, useGetUserBySubQuery } = usersApi