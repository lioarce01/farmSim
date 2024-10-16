'use client';

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { MarketListing } from 'src/types';

export const marketApi = createApi({
  reducerPath: 'marketApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3002/',
  }),

  endpoints: (builder) => ({
    getMarketListings: builder.query<MarketListing[], void>({
      query: () => '/market',
    }),
    getMarketListingsBySellerId: builder.query({
      query: (sellerId) => `/market/seller/${sellerId}`,
    }),
    createMarketListing: builder.mutation({
      query: (marketListing) => ({
        url: '/market',
        method: 'POST',
        body: marketListing,
      }),
    }),
    deleteMarketListing: builder.mutation({
      query: (marketListingId) => ({
        url: `/market/${marketListingId}`,
        method: 'DELETE',
      }),
    }),
    buySeed: builder.mutation({
      query: ({ marketListingId, buyerId }) => ({
        url: `/market/buy/${marketListingId}`,
        method: 'POST',
        body: { buyerId },
      }),
    }),
  }),
});

export const {
  useGetMarketListingsQuery,
  useGetMarketListingsBySellerIdQuery,
  useCreateMarketListingMutation,
  useDeleteMarketListingMutation,
  useBuySeedMutation,
} = marketApi;
