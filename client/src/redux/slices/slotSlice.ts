import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Slot } from '../../types/index'

// Define el estado inicial
const initialState: Slot[] = [];

// Crea el slice
const slotSlice = createSlice({
  name: 'slots',
  initialState,
  reducers: {
    setSlots(state, action: PayloadAction<Slot[]>) {
      return action.payload;
    },
    updateSlot(state, action: PayloadAction<Slot>) {
      const index = state.findIndex(slot => slot.id === action.payload.id);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },
    // Agrega otras acciones si es necesario
  },
});

// Exporta las acciones y el reducer
export const { setSlots, updateSlot } = slotSlice.actions;
export default slotSlice.reducer;
