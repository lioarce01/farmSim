import { createSlice } from '@reduxjs/toolkit';

const storeItemSlice = createSlice({
  name: 'store',
  initialState: null,
  reducers: {
    setUser: (state, action) => action.payload,
    clearUser: () => null,
  },
});

export const { setUser, clearUser } = storeItemSlice.actions;
export default storeItemSlice.reducer;
