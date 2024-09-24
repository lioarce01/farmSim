import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import { usersApi } from '../api/users'; // Ajusta la ruta según tu estructura de carpetas
import authReducer from '../slices/authSlice';
import { storeItemsApi } from '../api/store';
import timerReducer from '../slices/timerSlice';
import storage from 'redux-persist/lib/storage';

// Configuración de persistencia
const persistConfig = {
  key: 'root',
  storage, // No es necesario el "storage:" aquí, se puede simplificar
  version: 1,
  whitelist: ['auth'], // Solo persistir el estado de autenticación
};

// Combinamos todos los reducers en un rootReducer
const rootReducer = combineReducers({
  auth: authReducer,
  [storeItemsApi.reducerPath]: storeItemsApi.reducer,
  [usersApi.reducerPath]: usersApi.reducer,
  timer: timerReducer,
});

// Aplicamos el persistReducer para que auth esté persistido
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configuración del store
export const store = configureStore({
  reducer: persistedReducer,
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

// Persistor para persistir el estado
export const persistor = persistStore(store);

// Definición de tipos
export type RootState = ReturnType<typeof rootReducer>; // Incluye PersistPartial para evitar conflictos de tipos
export type AppDispatch = typeof store.dispatch;