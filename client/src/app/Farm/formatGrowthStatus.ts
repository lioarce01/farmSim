import { SeedStatus } from 'src/types';

export const formatGrowthStatus = (status: string | null) => {
  switch (status) {
    case SeedStatus.GROWING:
      return 'Growing';
    case SeedStatus.READY_TO_HARVEST:
      return 'Ready to harvest';
    case SeedStatus.WATER_NEEDED:
      return 'Water needed';
    case SeedStatus.WITHERED:
      return 'Withered';
    case SeedStatus.INFECTED:
      return 'Infected';
    case SeedStatus.HARVESTED:
      return 'Harvested';
    default:
      return 'None';
  }
};

export const formatLastWatered = (lastWatered: string | null) => {
  if (!lastWatered) return 'Never';
  const date = new Date(lastWatered);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};
