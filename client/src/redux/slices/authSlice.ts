import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: { 
    nickname: string | null; 
    email: string | null; 
  } | null;
  token: string | null | undefined; // Acepta también undefined
  loading: boolean;
  error: string | null;
}

// Estado inicial
const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: AuthState['user']; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loading = false; // Establecer loading a false al establecer el usuario
      state.error = null; // Limpiar el error
    },
    clearUser: () => initialState,

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false; // También establecer loading a false cuando hay un error
    },
    hydrate: (state, action: PayloadAction<AuthState>) => {
      if (action.payload) {
        state.user = action.payload.user || null
        state.token = action.payload.token || null
        state.loading = action.payload.loading;
        state.error = action.payload.error;
      }
    },    
  },
});

// Exportamos las acciones
export const { setUser, clearUser, setLoading, setError, hydrate } = authSlice.actions;

// Exportamos el reducer
export default authSlice.reducer;