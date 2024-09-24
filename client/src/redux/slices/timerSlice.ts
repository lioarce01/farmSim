import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TimerState {
  timeRemaining: number;
}

const initialState: TimerState = {
  timeRemaining: 0,
};

const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    setTimeRemaining(state, action: PayloadAction<number>) {
      state.timeRemaining = action.payload;
    },
    decrementTime(state) {
      state.timeRemaining = Math.max(0, state.timeRemaining - 1);
    },
  },
});

export const { setTimeRemaining, decrementTime } = timerSlice.actions;
export default timerSlice.reducer;