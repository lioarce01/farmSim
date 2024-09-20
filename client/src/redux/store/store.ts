import { configureStore } from '@reduxjs/toolkit';
import {usersApi } from '../api/users'; // Ajusta la ruta según tu estructura de carpetas
import authReducer from '../slices/authSlice'

export const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(usersApi.middleware),
  reducer: {
    auth: authReducer,
    [usersApi.reducerPath]: usersApi.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;