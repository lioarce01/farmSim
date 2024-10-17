import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Rarity, SeedStatus } from 'src/types';

interface FilterState {
  seedRarity: Rarity | null;
  growthStatus: SeedStatus | null;
}

const initialState: FilterState = {
  seedRarity: Rarity.ALL,
  growthStatus: SeedStatus.ALL,
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSeedRarity: (state, action: PayloadAction<Rarity | null>) => {
      state.seedRarity = action.payload;
    },
    setGrowthStatus: (state, action: PayloadAction<SeedStatus | null>) => {
      state.growthStatus = action.payload;
    },
    resetFilters(state) {
      state.seedRarity = Rarity.ALL;
      state.growthStatus = SeedStatus.ALL;
    },
  },
});

export const { setSeedRarity, setGrowthStatus, resetFilters } =
  filtersSlice.actions;
export default filtersSlice.reducer;
