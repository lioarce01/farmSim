'use client'

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import { usersApi } from '../api/users'; // Ajusta la ruta según tu estructura de carpetas
import userReducer from '../slices/userSlice'; // Ahora solo importas userReducer
import { storeItemsApi } from '../api/store';
import timerReducer from '../slices/timerSlice';
import createWebStorage from 'redux-persist/es/storage/createWebStorage';

console.log("Running on client:", typeof window !== 'undefined');

const createNoopStorage = () => {
  return {
    getItem(_key: string) {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: any) {
      return Promise.resolve(value);
    },
    removeItem(_key: string) {
      return Promise.resolve();
    },
  };
};

// Verifica si estás en el cliente
const storage = typeof window !== 'undefined' ? createWebStorage('local') : createNoopStorage();

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'], 
};

// Combinamos todos los reducers
const rootReducer = combineReducers({
  user: userReducer, 
  [storeItemsApi.reducerPath]: storeItemsApi.reducer,
  [usersApi.reducerPath]: usersApi.reducer,
  timer: timerReducer,
});

const localStorage = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: localStorage,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/FLUSH',
          'persist/PURGE',
          'persist/REGISTER',
        ],
      },
    }).concat(usersApi.middleware, storeItemsApi.middleware),
});

store.subscribe(() => {
  const state = store.getState();
  console.log('current state:', state);
});

export const persistor = persistStore(store);

// Definición de tipos
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
