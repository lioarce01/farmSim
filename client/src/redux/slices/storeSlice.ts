import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StoreItem } from 'src/types';

interface StoreState {
  items: StoreItem[];
}

const initialState: StoreState = {
  items: [],
};

const storeItemSlice = createSlice({
  name: 'store',
  initialState,
  reducers: {
    setStoreItems: (state, action: PayloadAction<StoreItem[]>) => {
      state.items = action.payload;
    },
    updateStock: (
      state,
      action: PayloadAction<{ itemId: string; newStock: number }>,
    ) => {
      const item = state.items.find((i) => i.id === action.payload.itemId);
      if (item) {
        item.stock = action.payload.newStock;
      }
    },
  },
});

export const { setStoreItems, updateStock } = storeItemSlice.actions;
export default storeItemSlice.reducer;
