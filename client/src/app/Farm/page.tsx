'use client';

import React, { useEffect, useState } from 'react';
import useFetchUser from '../../hooks/useFetchUser';
import InventoryPopup from '../../components/Inventory';
import Navbar from '../../components/Navbar';
import bgStore from '../assets/bgstore.jpg';
import Image from 'next/image';
import {
  useDeletePlantMutation,
  useGetFarmByIdQuery,
  useHarvestPlantMutation,
  usePlantSeedMutation,
  useWaterPlantMutation,
  useGetFarmSlotsQuery,
} from '../../redux/api/farm';
import { ClimateEvent, Rarity, SeedStatus, Slot } from 'src/types';
import useSocket from 'src/hooks/useSocket';
import { useAuth0 } from '@auth0/auth0-react';
import { formatGrowthStatus, formatLastWatered } from './formatGrowthStatus';
import FarmSlot from './farmSlot';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/redux/store/store';
import { setGrowthStatus, setSeedRarity } from 'src/redux/slices/filtersSlice';
import {
  clearClimateEvent,
  setClimateEvent,
} from 'src/redux/slices/climateEventSlice';
import ClimateEventDisplay from './ClimateEventDisplay';
import { Card, CardContent } from '../../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { ScrollArea } from '../../../components/ui/scroll-area';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../../../components/ui/alert';

export default function Farm() {
  const dispatch = useDispatch();
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const { user } = useAuth0();
  const {
    fetchedUser,
    fetchUserData,
    fetchError: userError,
    isLoading: userLoading,
  } = useFetchUser(user);
  const [plantSeed, { isLoading: isPlanting }] = usePlantSeedMutation();
  const [waterPlant, { isLoading: isWatering }] = useWaterPlantMutation();
  const [harvestPlant, { isLoading: isHarvesting }] = useHarvestPlantMutation();
  const [deletePlant, { isLoading: isDeleting }] = useDeletePlantMutation();
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [action, setAction] = useState<'plant' | 'water' | null>(null);
  const { seedRarity, growthStatus } = useSelector(
    (state: RootState) => state.filters,
  );

  const farmId = fetchedUser?.farm?.id;

  const {
    data: farm,
    error: farmError,
    isLoading: farmLoading,
    refetch: refetchFarm,
  } = useGetFarmByIdQuery(farmId, {
    skip: !farmId,
  });

  const {
    data: slots = [],
    error: slotError,
    isLoading: isSlotLoading,
    refetch: refetchFarmSlots,
  } = useGetFarmSlotsQuery({ farmId }, { skip: !farmId });

  const filteredSlots = slots.filter((slot: Slot) => {
    const matchesRarity = !seedRarity || slot.seedRarity === seedRarity;
    const matchesStatus = !growthStatus || slot.growthStatus === growthStatus;
    return matchesRarity && matchesStatus;
  });

  const socket = useSocket('http://localhost:3002');

  const currentEvent = useSelector(
    (state: RootState) => state.climateEvent.currentEvent,
  );

  useEffect(() => {
    if (socket) {
      socket.on('seed-planted', () => refetchFarmSlots());
      socket.on('actualizacion-planta', () => refetchFarmSlots());
      socket.on('seed-watered', () => refetchFarmSlots());
      socket.on('seed-harvested', () => refetchFarmSlots());
      socket.on('seed-deleted', () => refetchFarmSlots());
      socket.on('climateEvent', (event: ClimateEvent) => {
        console.log('Climate event received: ', event);
        dispatch(setClimateEvent(event));
      });
      socket.on('climateEventEnd', () => {
        dispatch(clearClimateEvent());
        refetchFarmSlots();
      });

      return () => {
        socket.off('seed-planted');
        socket.off('actualizacion-planta');
        socket.off('seed-watered');
        socket.off('seed-harvested');
        socket.off('seed-deleted');
        socket.off('climateEvent');
        socket.off('climateEventEnd');
      };
    }
  }, [socket, refetchFarmSlots, dispatch]);

  const handleOpenInventory = (
    slotIndex: number | null = null,
    action: 'plant' | 'water' | null = null,
  ) => {
    setSelectedSlot(slotIndex);
    setAction(action);
    setIsInventoryOpen(true);
    fetchUserData();
  };

  const handleCloseInventory = () => {
    setIsInventoryOpen(false);
    setSelectedSlot(null);
  };

  const handleSeedSelect = async (seed: any) => {
    if (selectedSlot !== null && farmId) {
      try {
        if (!seed.id) {
          console.error('Seed ID is missing!');
          return;
        }

        const seedData = {
          farmId,
          slotId: farm.slots[selectedSlot].id,
          seedId: seed.id,
          sub: user?.sub,
        };

        await plantSeed(seedData).unwrap();
      } catch (e) {
        const error = e as Error;
        console.error('Error planting seed:', error.message);
      } finally {
        handleCloseInventory();
      }
    }
  };

  const handleWaterSelect = async (water: any) => {
    if (selectedSlot !== null && farmId) {
      try {
        if (!water.id) {
          console.error('Water ID is missing!');
          return;
        }

        const seedData = {
          farmId,
          slotId: farm.slots[selectedSlot].id,
          waterId: water.id,
          userSub: user?.sub,
        };

        await waterPlant(seedData).unwrap();
      } catch (e) {
        const error = e as Error;
        console.error('Error watering seed:', error.message);
      } finally {
        handleCloseInventory();
      }
    }
  };

  const handleHarvestPlant = async (slotIndex: number) => {
    if (farmId) {
      try {
        const slotData = {
          farmId,
          slotId: farm.slots[slotIndex].id,
          sub: user?.sub,
        };
        const response = await harvestPlant(slotData).unwrap();
        fetchUserData();
        console.log('Plant harvested:', response);
      } catch (e) {
        const error = e as Error;
        console.error('Error harvesting plant:', error.message);
      }
    } else {
      console.log('FarmId is missing');
    }
  };

  const handleDeletePlant = async (slotIndex: number) => {
    if (farmId) {
      try {
        const slotData = {
          farmId,
          slotId: farm.slots[slotIndex].id,
          sub: user?.sub,
        };
        await deletePlant(slotData).unwrap();
      } catch (e) {
        const error = e as Error;
        console.error('Error deleting plant:', error.message);
      }
    }
  };

  if (userLoading || farmLoading) {
    return <div className="text-center text-lg">Loading...</div>;
  }

  if (userError || farmError) {
    const errorMessage = userError
      ? 'status' in userError
        ? `Error ${userError.status}: ${JSON.stringify(userError.data)}`
        : userError.message || 'Un error desconocido ocurrió'
      : farmError && 'status' in farmError
        ? `Error ${farmError.status}: ${JSON.stringify(farmError.data)}`
        : (farmError as any)?.message || 'Un error desconocido ocurrió';

    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    );
  }

  const handleRarityChange = (value: Rarity | 'ALL') => {
    dispatch(setSeedRarity(value === 'ALL' ? null : value));
  };

  const handleGrowthStatusChange = (value: SeedStatus | 'ALL') => {
    dispatch(setGrowthStatus(value === 'ALL' ? null : value));
  };

  return (
    <div className="min-h-screen bg-[#14141b] text-white">
      <Navbar />
      <div className="container mx-auto px-4 pt-28 pb-10">
        <Card className="w-full bg-[#1a1a25] border-[#2a2a3b] shadow-lg overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start justify-between space-y-4 md:space-y-0 md:space-x-4 mb-8">
              <div className="w-full md:w-1/3">
                <ClimateEventDisplay event={currentEvent} />
              </div>

              <div className="flex flex-col w-full md:w-2/3 xl:w-1/4 space-y-4">
                <Select
                  name="rarity"
                  onValueChange={handleRarityChange}
                  value={seedRarity || undefined}
                >
                  <SelectTrigger className="w-full bg-[#2a2a3b]">
                    <SelectValue placeholder="Select Rarity" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2a2a3b] text-white">
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="COMMON">Common</SelectItem>
                    <SelectItem value="UNCOMMON">Uncommon</SelectItem>
                    <SelectItem value="RARE">Rare</SelectItem>
                    <SelectItem value="EPIC">Epic</SelectItem>
                    <SelectItem value="LEGENDARY">Legendary</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  name="growthStatus"
                  onValueChange={handleGrowthStatusChange}
                  value={growthStatus || undefined}
                >
                  <SelectTrigger className="w-full bg-[#2a2a3b]">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2a2a3b] text-white">
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="GROWING">Growing</SelectItem>
                    <SelectItem value="READY_TO_HARVEST">
                      Ready to harvest
                    </SelectItem>
                    <SelectItem value="WITHERED">Withered</SelectItem>
                    <SelectItem value="WATER_NEEDED">Need Water</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-300px)] rounded-md border border-[#2a2a3b]">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
                {filteredSlots.length > 0 ? (
                  filteredSlots.map((slot: Slot, index: number) => (
                    <FarmSlot
                      key={index}
                      slot={slot}
                      index={index}
                      farmId={slots.farmId}
                      isPlanting={isPlanting}
                      isWatering={isWatering}
                      isHarvesting={isHarvesting}
                      isDeleting={isDeleting}
                      handleOpenInventory={handleOpenInventory}
                      handleHarvestPlant={handleHarvestPlant}
                      handleDeletePlant={handleDeletePlant}
                      formatLastWatered={formatLastWatered}
                      formatGrowthStatus={formatGrowthStatus}
                      filters={{
                        seedRarity: 'COMMON',
                        growthStatus: 'GROWING',
                      }}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center text-lg">
                    No plants available.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {isInventoryOpen && (
          <InventoryPopup
            isOpen={isInventoryOpen}
            onClose={handleCloseInventory}
            onSeedSelect={handleSeedSelect}
            onWaterSelect={handleWaterSelect}
            selectedSlot={selectedSlot}
            action={action}
          />
        )}
      </div>
    </div>
  );
}
