'use client';

import React from 'react';
import { Slot, SeedStatus, Rarity } from 'src/types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Droplet, Trash2, Sprout } from 'lucide-react';

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

const rarityColors = {
  [Rarity.LEGENDARY]: 'bg-yellow-500',
  [Rarity.EPIC]: 'bg-purple-600',
  [Rarity.RARE]: 'bg-blue-600',
  [Rarity.UNCOMMON]: 'bg-gray-500',
  [Rarity.COMMON]: 'bg-gray-700',
};

const statusColors: Record<SeedStatus, string> = {
  [SeedStatus.GROWING]: 'bg-green-600',
  [SeedStatus.READY_TO_HARVEST]: 'bg-emerald-600',
  [SeedStatus.WATER_NEEDED]: 'bg-orange-500',
  [SeedStatus.WITHERED]: 'bg-red-500',
  [SeedStatus.INFECTED]: 'bg-red-700',
  [SeedStatus.ALL]: 'bg-gray-600',
  [SeedStatus.NONE]: 'bg-gray-400',
  [SeedStatus.HARVESTED]: 'bg-blue-500',
};

export default function FarmSlot({
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
}: FarmSlotProps) {
  return (
    <Card className="bg-[#2a2a3b] border-[#2a2a3b] transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105">
      <CardHeader>
        <CardTitle className="text-xl text-center">
          {slot.seedName || 'Empty Slot'}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        {slot.seedName ? (
          <>
            <Badge
              className={`${rarityColors[slot.seedRarity as keyof typeof rarityColors] || 'bg-gray-600'}`}
            >
              {slot.seedRarity || 'Unknown'}
            </Badge>
            <Badge
              className={
                statusColors[slot.growthStatus as SeedStatus] || 'bg-gray-600'
              }
            >
              {formatGrowthStatus(slot.growthStatus)}
            </Badge>
            <p className="text-sm text-gray-400">
              Last Watered:{' '}
              <span className="font-semibold text-white">
                {formatLastWatered(slot.lastWatered)}
              </span>
            </p>
          </>
        ) : (
          <Sprout className="w-16 h-16 text-gray-600" />
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        {slot.seedName ? (
          <div className="flex flex-col space-y-2 w-full">
            {slot.growthStatus === SeedStatus.WATER_NEEDED && (
              <Button
                variant="outline"
                className="w-full bg-[#36364b]"
                onClick={() => handleOpenInventory(index, 'water')}
                disabled={isWatering}
              >
                <Droplet className="mr-2 h-4 w-4" />
                Water
              </Button>
            )}
            {slot.growthStatus === SeedStatus.READY_TO_HARVEST && (
              <Button
                variant="outline"
                className="w-full bg-[#36364b] hover:bg-[#404058] transition duration-300"
                onClick={() => handleHarvestPlant(index)}
                disabled={isHarvesting}
              >
                {isHarvesting ? 'Harvesting...' : 'Harvest'}
              </Button>
            )}
            {slot.growthStatus === SeedStatus.WITHERED && (
              <Button
                variant="destructive"
                className="w-full bg-[#36364b] hover:bg-[#404058] transition duration-300"
                onClick={() => handleDeletePlant(index)}
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full bg-[#36364b] hover:bg-[#404058] transition duration-300"
            onClick={() => handleOpenInventory(index, 'plant')}
            disabled={isPlanting}
          >
            <Sprout className="mr-2 h-4 w-4" />
            Add Seed
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
