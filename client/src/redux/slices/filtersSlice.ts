import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Rarity, SeedStatus } from 'src/types';

interface FilterState {
  seedRarity: Rarity;
  growthStatus: SeedStatus;
}

const initialState: FilterState = {
  seedRarity: Rarity.ALL,
  growthStatus: SeedStatus.ALL,
};

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSeedRarity(state, action: PayloadAction<Rarity>) {
      state.seedRarity = action.payload;
    },
    setGrowthStatus(state, action: PayloadAction<SeedStatus>) {
      state.growthStatus = action.payload;
    },
    resetFilters(state) {
      state.seedRarity = Rarity.ALL;
      state.growthStatus = SeedStatus.ALL;
    },
  },
});

export const { setSeedRarity, setGrowthStatus, resetFilters } =
  filterSlice.actions;
export default filterSlice.reducer;
