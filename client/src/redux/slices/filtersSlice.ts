import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Rarity, SeedStatus } from 'src/types';

interface FilterState {
  seedRarity: Rarity | null;
  growthStatus: SeedStatus | null;
  sortOrder: string | null;
}

const initialState: FilterState = {
  seedRarity: Rarity.ALL,
  growthStatus: SeedStatus.ALL,
  sortOrder: 'desc',
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
    setSortOrder: (state, action: PayloadAction<string | null>) => {
      state.sortOrder = action.payload;
    },
    resetFilters(state) {
      state.seedRarity = Rarity.ALL;
      state.growthStatus = SeedStatus.ALL;
      state.sortOrder = null;
    },
  },
});

export const { setSeedRarity, setGrowthStatus, setSortOrder, resetFilters } =
  filtersSlice.actions;
export default filtersSlice.reducer;
