'use client';

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { User } from '../../types';

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3002/',
  }),
  tagTypes: ['User'],

  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => 'users',
      providesTags: ['User'],
    }),

    getUserBySub: builder.query<User, string>({
      query: (sub) => `/users/${sub}`,
      providesTags: (result, error, sub) => [{ type: 'User', sub }],
    }),

    registerUser: builder.mutation({
      query: (userData) => ({
        url: '/users/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    convertUser: builder.mutation({
      query: (body) => ({
        url: '/users/convert',
        method: 'PUT',
        body: body,
      }),
      invalidatesTags: ['User'],
    }),
    addTokens: builder.mutation({
      query: (body) => ({
        url: '/users/addTokens',
        method: 'POST',
        body: body,
      }),
      invalidatesTags: (result, error, body) => [
        { type: 'User', sub: body.sub },
      ],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useRegisterUserMutation,
  useConvertUserMutation,
  useGetUserBySubQuery,
  useAddTokensMutation,
} = usersApi;
