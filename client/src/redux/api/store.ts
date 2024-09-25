import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store/store';
import { RemainingTimeData, StoreItem } from '../../types'; // Asegúrate de que esta ruta sea correcta


export const storeItemsApi = createApi({
  reducerPath: 'storeApi',
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
    getStoreItems: builder.query<StoreItem[], void>({
      query: () => 'store',
    }),
    getRemainingTime: builder.query<RemainingTimeData, void>({
      query: () => 'store/refreshStore',
    }),
  }),
  
});

export const { useGetStoreItemsQuery, useGetRemainingTimeQuery } = storeItemsApi;
