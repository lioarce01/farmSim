import { configureStore } from '@reduxjs/toolkit';
import { api } from '../services/api'; // Ajusta la ruta según tu estructura de carpetas
import authReducer from '../services/auth/authSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;