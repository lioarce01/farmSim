'use client';

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { PurchaseData, RemainingTimeData, StoreItem } from '../../types';

export const storeItemsApi = createApi({
  reducerPath: 'storeApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3002/',
  }),

  endpoints: (builder) => ({
    getStoreItems: builder.query<StoreItem[], void>({
      query: () => 'store',
    }),
    getRemainingTime: builder.query<RemainingTimeData, void>({
      query: () => 'store/refreshStore',
    }),
    getStoreBuy: builder.mutation<void, PurchaseData>({
      query: (purchaseData) => ({
        url: 'store/buy',
        method: 'POST',
        body: purchaseData,
      }),
    }),
    getStoreItemById: builder.query<StoreItem, string>({
      query: (id) => `store/item/${id}`,
    }),
  }),
});

export const {
  useGetStoreItemsQuery,
  useGetRemainingTimeQuery,
  useGetStoreBuyMutation,
  useGetStoreItemByIdQuery,
} = storeItemsApi;
