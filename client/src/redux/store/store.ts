import { configureStore } from '@reduxjs/toolkit';
import { usersApi } from '../api/users'; // Ajusta la ruta según tu estructura de carpetas
import authReducer from '../slices/authSlice'
import { storeItemsApi } from '../api/store';
import timerReducer from '../slices/timerSlice'

export const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(usersApi.middleware, storeItemsApi.middleware),
  reducer: {
    auth: authReducer,
    [storeItemsApi.reducerPath]: storeItemsApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    timer: timerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;