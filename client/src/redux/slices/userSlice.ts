'use client'

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  nickname: string | null;
  email: string | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  nickname: null,
  email: null,
  token: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ nickname: string; email: string; token: string; }>) => {
      console.log('Dispatching setUser with: ', action.payload)
      state.nickname = action.payload.nickname;
      state.email = action.payload.email;
      state.token = action.payload.token;
      state.loading = false;
      state.error = null
      // localStorage.setItem('user', JSON.stringify(state))
    },
    clearUser(state) {
      state.nickname = null;
      state.email = null;
      state.token = null;
      state.loading = false;
      state.error = null;
      // localStorage.removeItem('user')

    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false; // Establecer loading a false cuando hay un error
    },
    hydrate: (state, action: PayloadAction<UserState>) => {
      if (action.payload) {
        state.nickname = action.payload.nickname || null;
        state.email = action.payload.email || null;
        state.token = action.payload.token || null;
        state.loading = action.payload.loading;
        state.error = action.payload.error;
      }
    },
  },
});

// Exportamos las acciones
export const { setUser, clearUser, setLoading, setError, hydrate } = userSlice.actions;

// Exportamos el reducer
export default userSlice.reducer;