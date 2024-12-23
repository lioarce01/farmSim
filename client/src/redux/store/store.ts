'use client';

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import { usersApi } from '../api/users';
import userReducer from '../slices/userSlice';
import slotReducer from '../slices/slotSlice';
import filterReducer from '../slices/filtersSlice';
import { storeItemsApi } from '../api/store';
import timerReducer from '../slices/timerSlice';
import createWebStorage from 'redux-persist/es/storage/createWebStorage';
import { farmApi } from '../api/farm';
import climateEventReducer from '../slices/climateEventSlice';
import { marketApi } from '../api/market';

console.log('Running on client:', typeof window !== 'undefined');

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

const storage =
  typeof window !== 'undefined'
    ? createWebStorage('local')
    : createNoopStorage();

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user', 'slots', 'timer', 'filters', 'climateEvent', 'market'],
};

const rootReducer = combineReducers({
  user: userReducer,
  slot: slotReducer,
  filters: filterReducer,
  climateEvent: climateEventReducer,
  [storeItemsApi.reducerPath]: storeItemsApi.reducer,
  [usersApi.reducerPath]: usersApi.reducer,
  [farmApi.reducerPath]: farmApi.reducer,
  [marketApi.reducerPath]: marketApi.reducer,
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
    }).concat(
      usersApi.middleware,
      storeItemsApi.middleware,
      farmApi.middleware,
      marketApi.middleware,
    ),
});

export const persistor = persistStore(store);

// Definición de tipos
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
