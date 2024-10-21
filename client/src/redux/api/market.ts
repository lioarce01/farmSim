'use client';

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const marketApi = createApi({
  reducerPath: 'marketApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3002/',
  }),
  tagTypes: ['MarketListing', 'User'],

  endpoints: (builder) => ({
    getMarketListings: builder.query({
      query: ({ rarity, sortBy }) => {
        const queryString = new URLSearchParams({ rarity, sortBy }).toString();
        return `/market?${queryString}`;
      },
      providesTags: ['MarketListing'],
    }),
    getMarketListingsBySellerId: builder.query({
      query: (sellerId) => `/market/seller/${sellerId}`,
      providesTags: ['MarketListing'],
    }),
    createMarketListing: builder.mutation({
      query: ({ price, sellerId, seedId }) => ({
        url: '/market',
        method: 'POST',
        body: { price, sellerId, seedId },
      }),
      invalidatesTags: ['MarketListing'],
    }),
    getMarketListingById: builder.query({
      query: (id) => `/market/${id}`,
      providesTags: ['MarketListing'],
    }),
    deleteMarketListing: builder.mutation({
      query: (marketListingId) => ({
        url: `/market/${marketListingId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MarketListing'],
    }),
    getBuySeed: builder.mutation({
      query: ({ marketListingId, buyerId }) => ({
        url: `/market/buy/${marketListingId}`,
        method: 'POST',
        body: { buyerId },
      }),
      invalidatesTags: ['MarketListing', 'User'],
    }),
  }),
});

export const {
  useGetMarketListingsQuery,
  useGetMarketListingsBySellerIdQuery,
  useGetMarketListingByIdQuery,
  useCreateMarketListingMutation,
  useDeleteMarketListingMutation,
  useGetBuySeedMutation,
} = marketApi;
