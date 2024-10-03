'use client'

import React, { useEffect, useState } from 'react';
import useFetchUser from '../../hooks/useFetchUser';
import InventoryPopup from '../../components/Inventory';
import Navbar from '../../components/Navbar';
import { useGetFarmByIdQuery, useHarvestPlantMutation, usePlantSeedMutation, useWaterPlantMutation } from '../../redux/api/farm';
import { Slot } from 'src/types';
import { SeedStatus, Rarity } from 'src/types';
import useSocket from 'src/hooks/useSocket';

const Farm = () => {
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const { user, error: userError, isLoading: userLoading } = useFetchUser();
  const [plantSeed, { isLoading: isPlanting }] = usePlantSeedMutation();
  const [waterPlant, {isLoading: isWatering}] = useWaterPlantMutation()
  const [harvestPlant, {isLoading: isHarvesting}] = useHarvestPlantMutation()
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [action, setAction] = useState<'plant' | 'water' | null>(null);

  const farmId = user?.farm?.id;

  const { data: farm, error: farmError, isLoading: farmLoading, refetch: refetchFarm } = useGetFarmByIdQuery(farmId, {
    skip: !farmId,
  });

  const socket = useSocket('http://localhost:3002'); 

  useEffect(() => {
    if (socket) {
      socket.on('seed-planted', (data) => {
        console.log('Seed planted event received:', data);
        refetchFarm(); 
      });

      socket.on('actualizacion-planta', (data) => {
        console.log('Plant update event received:', data);
        refetchFarm(); 
      });

      socket.on('seed-watered', (data) => {
        console.log('Plant update event received:', data);
        refetchFarm(); 
      });

      socket.on('seed-harvested', (data) => {
        console.log('Plant update event received:', data);
        refetchFarm(); 
      });

      return () => {
        socket.off('seed-planted');
        socket.off('actualizacion-planta'); 
        socket.off('seed-watered'); 
        socket.off('seed-harvested')
      };
    }
  }, [socket, farm]);

  if (userLoading) return <div className="text-center text-lg">Loading user...</div>;
  if (userError) {
    const errorMessage = 'status' in userError
      ? `Error ${userError.status}: ${JSON.stringify(userError.data)}`
      : userError.message || 'An unknown error occurred';
    return <div className="text-center text-red-500">Error loading user: {errorMessage}</div>;
  }
  if (farmLoading) return <div className="text-center text-lg">Loading farm...</div>;
  if (farmError) {
    const errorMessage = 'status' in farmError
      ? `Error ${farmError.status}: ${JSON.stringify(farmError.data)}`
      : (farmError as any).message || 'An unknown error occurred';
    return <div className="text-center text-red-500">Error loading farm: {errorMessage}</div>;
  }

  const formatLastWatered = (lastWatered: string | null) => {
    if (!lastWatered) return 'Never';

    const lastWateredDate = new Date(lastWatered);
    const now = new Date();
    const diff = Math.abs(now.getTime() - lastWateredDate.getTime());

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const openInventory = (slotIndex: number | null = null, action: 'plant' | 'water' | null = null) => {
    setSelectedSlot(slotIndex);
    setAction(action);
    setIsInventoryOpen(true);
  };

  const closeInventory = () => {
    setIsInventoryOpen(false);
    setSelectedSlot(null);
  };

  const plantSeedInSlot = async (seed: any) => {
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

        await plantSeed(seedData).unwrap()
      } catch (e) {
        const error = e as Error
        console.error('Error planting seed:', error.message);
      } finally {
        closeInventory()
      }
    }
  };

  const waterPlantInSlot = async (water: any) => {
    if (selectedSlot !== null && farmId) {
      try {
        if(!water.id) {
          console.error('Water ID is missing!')
          return
        }

        const seedData = {
          farmId,
          slotId: farm.slots[selectedSlot].id,
          waterId: water.id,
          userSub: user?.sub
        }

        await waterPlant(seedData).unwrap()
      } catch(e) {
        const error = e as Error
        console.error('Error watering seed:', error.message)
      } finally {
        closeInventory()
      }
    }
  };

  const harvestPlantInSlot = async (slotIndex: number) => {

    if (farmId){
      try {
        const slotData = {
          farmId,
          slotId: farm.slots[slotIndex].id,
          sub: user?.sub
        }

        const response = await harvestPlant(slotData).unwrap()
      } catch(e) {
        const error = e as Error
        console.error('Error harvesting plant:', error.message)
      }
    } else {
      console.log('Farmid is missing')
    }
  };

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

  return (
    <div className="bg-[#FFF5D1] min-h-screen">
      <Navbar />
      <div className="p-4 sm:p-8" style={{ paddingTop: '120px' }}>
        <h1 className="text-[#172c1f] text-3xl font-bold mb-6 text-center">My Farm</h1>

        {/* Botón para abrir el inventario */}
        <div className="flex justify-center mb-6">
          <button
            className="bg-[#FFB385] text-[#172c1f] font-semibold px-4 py-2 rounded-lg hover:bg-[#FFC1A1] transition duration-300"
            onClick={() => openInventory(null, 'plant')}
          >
            Inventory
          </button>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6 mt-18">
          {farm.slots.map((slot: Slot, index: number) => (
            <div key={index} className="border-4 border-[#FFB385] bg-[#FDE8C9] p-4 flex flex-col items-center justify-between rounded-lg shadow-lg transition-transform transform hover:scale-105">
              {slot.seedName ? (
                <>
                  <div className="font-bold text-xl mb-2">{slot.seedName}</div>
                  <span className="font-bold text-sm my-1">
                    Rarity:&nbsp;
                    <span className={`${
                      slot.seedRarity === Rarity.LEGENDARY ? 'text-yellow-500' :
                      slot.seedRarity === Rarity.EPIC ? 'text-purple-600' :
                      slot.seedRarity === Rarity.RARE ? 'text-blue-600' :
                      slot.seedRarity === Rarity.UNCOMMON ? 'text-gray-500' :
                      'text-gray-700'
                    }`}>
                      {slot.seedRarity || 'Unknown'}
                    </span>
                  </span>
                  <span className="font-bold text-sm my-1">
                    Status:&nbsp;
                    <span className={`${
                      slot.growthStatus === SeedStatus.GROWING ? 'text-green-600' :
                      slot.growthStatus === SeedStatus.READY_TO_HARVEST ? 'text-[#399c7b]' :
                      slot.growthStatus === SeedStatus.WATER_NEEDED ? 'text-orange-500' :
                      slot.growthStatus === SeedStatus.WITHERED ? 'text-red-500' :
                      slot.growthStatus === SeedStatus.INFECTED ? 'text-red-700' :
                      'text-gray-600'
                    }`}>
                      {formatGrowthStatus(slot.growthStatus)}
                    </span>
                  </span>
                  <span className="font-medium text-sm my-1">
                    Last Watered: <span className="text-gray-700 font-bold">{formatLastWatered(slot.lastWatered)}</span>
                  </span>
                  <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mt-2">
                    {slot.growthStatus === SeedStatus.WATER_NEEDED && (
                      <button
                        className="mt-2 px-4 py-2 rounded-lg font-semibold transition-colors duration-300 bg-[#398b5a] text-white hover:bg-[#276844]"
                        onClick={() => openInventory(index, 'water')}
                        disabled={isWatering}
                      >
                        Water
                      </button>
                    )}
                    {slot.growthStatus === SeedStatus.READY_TO_HARVEST && (
                      <button
                        className="mt-2 px-4 py-2 rounded-lg font-semibold transition-colors duration-300 bg-[#398b5a] text-white hover:bg-[#276844]"
                        onClick={() => harvestPlantInSlot(index)}
                        disabled={isHarvesting}
                      >
                        {isHarvesting ? 'Harvesting...' : 'Harvest'}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <button
                  className="mt-2 px-4 py-2 rounded-lg font-semibold transition-colors duration-300 bg-[#398b5a] text-white hover:bg-[#276844]"
                  onClick={() => openInventory(index, 'plant')}
                  disabled={isPlanting}
                >
                  Add Seed
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <InventoryPopup
        isOpen={isInventoryOpen}
        onClose={closeInventory}
        onSeedSelect={plantSeedInSlot}
        onWaterSelect={waterPlantInSlot}
      />
    </div>
  );
};

export default Farm;