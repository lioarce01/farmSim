'use client';

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const farmApi = createApi({
  reducerPath: 'farmApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3002/',
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
      }),
    }),
    waterPlant: builder.mutation({
      query: (seedData) => ({
        url: '/farm/water-plant',
        method: 'PUT',
        body: seedData,
      }),
    }),
    harvestPlant: builder.mutation({
      query: (slotData) => ({
        url: '/farm/harvest-plant',
        method: 'PUT',
        body: slotData,
      }),
    }),
    deletePlant: builder.mutation({
      query: (slotData) => ({
        url: '/farm/delete-plant',
        method: 'DELETE',
        body: slotData,
      }),
    }),
  }),
});

export const {
  useDeletePlantMutation,
  useGetFarmsQuery,
  useGetFarmByIdQuery,
  useHarvestPlantMutation,
  usePlantSeedMutation,
  useWaterPlantMutation,
} = farmApi;
