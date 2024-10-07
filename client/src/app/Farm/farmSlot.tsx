'use client';

// components/FarmSlot.tsx
import React from 'react';
import { Slot, SeedStatus, Rarity } from 'src/types';

interface FarmSlotProps {
  slot: Slot;
  index: number;
  isPlanting: boolean;
  isWatering: boolean;
  isHarvesting: boolean;
  isDeleting: boolean;
  farmId: string;
  handleOpenInventory: (
    slotIndex: number,
    action: 'plant' | 'water' | null,
  ) => void;
  handleHarvestPlant: (slotIndex: number) => Promise<void>;
  handleDeletePlant: (slotIndex: number) => Promise<void>;
  formatLastWatered: (lastWatered: string | null) => string;
  formatGrowthStatus: (status: string | null) => string;
  filters: {
    seedRarity?: string;
    growthStatus?: string;
  };
}

const FarmSlot: React.FC<FarmSlotProps> = ({
  slot,
  index,
  isPlanting,
  isWatering,
  isHarvesting,
  isDeleting,
  handleOpenInventory,
  handleHarvestPlant,
  handleDeletePlant,
  formatLastWatered,
  formatGrowthStatus,
}) => {
  return (
    <div className="border-4 border-[#FFB385] bg-[#FDE8C9] p-4 flex flex-col items-center justify-between rounded-lg shadow-lg transition-transform transform hover:scale-105">
      {slot.seedName ? (
        <>
          <div className="font-bold text-xl mb-2">{slot.seedName}</div>
          <span className="font-bold text-sm my-1">
            Rarity:&nbsp;
            <span
              className={`${
                slot.seedRarity === Rarity.LEGENDARY
                  ? 'text-yellow-500'
                  : slot.seedRarity === Rarity.EPIC
                    ? 'text-purple-600'
                    : slot.seedRarity === Rarity.RARE
                      ? 'text-blue-600'
                      : slot.seedRarity === Rarity.UNCOMMON
                        ? 'text-gray-500'
                        : 'text-gray-700'
              }`}
            >
              {slot.seedRarity || 'Unknown'}
            </span>
          </span>
          <span className="font-bold text-sm my-1">
            Status:&nbsp;
            <span
              className={`${
                slot.growthStatus === SeedStatus.GROWING
                  ? 'text-green-600'
                  : slot.growthStatus === SeedStatus.READY_TO_HARVEST
                    ? 'text-[#399c7b]'
                    : slot.growthStatus === SeedStatus.WATER_NEEDED
                      ? 'text-orange-500'
                      : slot.growthStatus === SeedStatus.WITHERED
                        ? 'text-red-500'
                        : slot.growthStatus === SeedStatus.INFECTED
                          ? 'text-red-700'
                          : 'text-gray-600'
              }`}
            >
              {formatGrowthStatus(slot.growthStatus)}
            </span>
          </span>
          <span className="font-medium text-sm my-1">
            Last Watered:&nbsp;
            <span className="text-gray-700 font-bold">
              {formatLastWatered(slot.lastWatered)}
            </span>
          </span>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mt-2">
            {slot.growthStatus === SeedStatus.WATER_NEEDED && (
              <button
                className="mt-2 px-4 py-2 rounded-lg font-semibold transition-colors duration-300 bg-[#398b5a] text-white hover:bg-[#276844]"
                onClick={() => handleOpenInventory(index, 'water')}
                disabled={isWatering}
              >
                Water
              </button>
            )}
            {slot.growthStatus === SeedStatus.READY_TO_HARVEST && (
              <button
                className="mt-2 px-4 py-2 rounded-lg font-semibold transition-colors duration-300 bg-[#398b5a] text-white hover:bg-[#276844]"
                onClick={() => handleHarvestPlant(index)}
                disabled={isHarvesting}
              >
                {isHarvesting ? 'Harvesting...' : 'Harvest'}
              </button>
            )}
            {slot.growthStatus === SeedStatus.WITHERED && (
              <button
                className="mt-2 px-4 py-2 rounded-lg font-semibold transition-colors duration-300 bg-[#398b5a] text-white hover:bg-[#276844]"
                onClick={() => handleDeletePlant(index)}
                disabled={isDeleting}
              >
                Delete
              </button>
            )}
          </div>
        </>
      ) : (
        <button
          className="mt-2 px-4 py-2 rounded-lg font-semibold transition-colors duration-300 bg-[#398b5a] text-white hover:bg-[#276844]"
          onClick={() => handleOpenInventory(index, 'plant')}
          disabled={isPlanting}
        >
          Add Seed
        </button>
      )}
    </div>
  );
};

export default FarmSlot;
