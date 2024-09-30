import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store/store';

export const farmApi = createApi({
  reducerPath: 'farmApi',
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
    getFarms: builder.query({
      query: () => 'farm',
    }),
    getFarmById: builder.query({
        query: (id) => `/farm/${id}`,
    }),
    plantSeed: builder.mutation({
        query: (seedData) => ({
            url: '/farm/plant-seed',
            method: 'POST',
            body: seedData,
        })
    }),
    waterPlant: builder.mutation({
        query: (seedData) => ({
            url: '/farm/water-plant',
            method: 'PUT',
            body: seedData
        })
    }),
    harvestPlant: builder.mutation({
        query: (seedData) => ({
            url: '/farm/harvest-plant',
            method: 'POST',
            body: seedData
        })
    }),
  }),
  
});

export const { useGetFarmsQuery ,useGetFarmByIdQuery, useHarvestPlantMutation, usePlantSeedMutation, useWaterPlantMutation } = farmApi;
