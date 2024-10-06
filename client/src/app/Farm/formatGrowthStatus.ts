import { SeedStatus } from 'src/types';

const formatGrowthStatus = (status: string | null) => {
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

export default formatGrowthStatus;
