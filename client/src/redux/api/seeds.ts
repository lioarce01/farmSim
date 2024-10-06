'use client';

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Seed, User } from '../../types';

export const seedsApi = createApi({
  reducerPath: 'seedApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3002/',
  }),

  endpoints: (builder) => ({
    getSeeds: builder.query<Seed[], void>({
      query: () => 'seeds',
    }),
  }),
});

export const { useGetSeedsQuery } = seedsApi;
