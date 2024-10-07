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

export const formatLastWatered = (lastWatered: string | null): string => {
  if (!lastWatered) return 'Never';

  const now = new Date();
  const wateredDate = new Date(lastWatered);
  const timeDifference = now.getTime() - wateredDate.getTime(); // Diferencia en milisegundos

  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return days === 1 ? '1 day ago' : `${days} days ago`;
  } else if (hours > 0) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  } else if (minutes > 0) {
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  } else {
    return seconds === 1 ? '1 second ago' : `${seconds} seconds ago`;
  }
};
