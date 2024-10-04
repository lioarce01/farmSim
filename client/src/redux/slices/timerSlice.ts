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
    setTimeRemaining(state: TimerState, action: PayloadAction<number>) {
      state.timeRemaining = action.payload;
    },
    decrementTime(state: TimerState) {
      state.timeRemaining = Math.max(0, state.timeRemaining - 1);
    },
    setInitialTime(state: TimerState, action: PayloadAction<number>) {
      state.timeRemaining = action.payload
    }
  },
});

export const { setTimeRemaining, decrementTime, setInitialTime } = timerSlice.actions;
export default timerSlice.reducer;