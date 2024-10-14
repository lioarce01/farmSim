import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ClimateEvent } from 'src/types';

interface ClimateEventState {
  currentEvent: ClimateEvent | null;
}

const initialState: ClimateEventState = {
  currentEvent: null,
};

const climateEventSlice = createSlice({
  name: 'climateEvent',
  initialState,
  reducers: {
    setClimateEvent(state, action: PayloadAction<ClimateEvent>) {
      state.currentEvent = action.payload;
    },
    clearClimateEvent(state) {
      state.currentEvent = null;
    },
  },
});

export const { setClimateEvent, clearClimateEvent } = climateEventSlice.actions;
export const selectCurrentEvent = (state: {
  climateEvent: ClimateEventState;
}) => state.climateEvent.currentEvent;

export default climateEventSlice.reducer;
