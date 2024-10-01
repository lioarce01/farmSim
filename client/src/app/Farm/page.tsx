'use client'

import React, { useEffect, useState } from 'react';
import useFetchUser from '../../hooks/useFetchUser';
import InventoryPopup from '../../components/Inventory';
import Navbar from '../../components/Navbar';
import { useGetFarmByIdQuery, usePlantSeedMutation } from '../../redux/api/farm';
import { Slot } from 'src/types';
import { SeedStatus, Rarity } from 'src/types';
import useSocket from 'src/hooks/useSocket';

const Farm = () => {
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const { user, error: userError, isLoading: userLoading } = useFetchUser();
  const [plantSeed, { isLoading: isPlanting }] = usePlantSeedMutation();
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const farmId = user?.farm?.id;

  const { data: farm, error: farmError, isLoading: farmLoading, refetch: refetchFarm } = useGetFarmByIdQuery(farmId, {
    skip: !farmId,
  });

  const socket = useSocket('http://localhost:3002'); // Conectar al servidor de socket

  useEffect(() => {
    if (socket) {
      socket.on('seed-planted', (data) => {
        console.log('Seed planted event received:', data);
        refetchFarm(); // Refresca la granja para obtener datos actualizados
      });

      socket.on('actualizacion-planta', (data) => {
        console.log('Plant update event received:', data);
        // En lugar de modificar directamente farm.slots, puedes refetch o manejar la lógica aquí.
        refetchFarm(); // Vuelve a obtener los datos para reflejar el estado actualizado
      });

      return () => {
        socket.off('seed-planted');
        socket.off('actualizacion-planta'); // Limpia el evento al desmontar el componente
      };
    }
  }, [socket, farm]);


  // Loading and error handling
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

  // Function to format last watered time
  const formatLastWatered = (lastWatered: string | null) => {
    if (!lastWatered) return 'Never';

    const lastWateredDate = new Date(lastWatered);
    const now = new Date();
    const diff = Math.abs(now.getTime() - lastWateredDate.getTime());

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };


  const openInventory = (slotIndex: number) => {
    setSelectedSlot(slotIndex);
    setIsInventoryOpen(true);
  };

  const closeInventory = () => {
    setIsInventoryOpen(false);
    setSelectedSlot(null);
  };

  // Plant seed in selected slot
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

        await plantSeed(seedData).unwrap();
        closeInventory();
      } catch (e) {
        console.error('Error planting seed:', e);
      }
    }
  };

  // Functions for watering and harvesting plants
  const waterPlant = (slotIndex: number) => {
    console.log(`Watering plant in slot ${slotIndex}`);
    // Lógica para regar la planta aquí
  };

  const harvestPlant = (slotIndex: number) => {
    console.log(`Harvesting plant in slot ${slotIndex}`);
    // Lógica para cosechar la planta aquí
  };

  // Function to format growth status
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
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6 mt-18">
          {farm.slots.map((slot: Slot, index: number) => (
            <div
              key={index}
              className="border-4 border-[#FFB385] bg-[#FDE8C9] p-4 flex flex-col items-center justify-between rounded-lg shadow-lg transition-transform transform hover:scale-105"
            >
              {slot.seedName ? (
                <>
                  <span className="text-[#172c1f] font-semibold text-lg">{slot.seedName}</span>
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
                        className={`mt-2 px-4 py-2 rounded-lg font-semibold transition-colors duration-300 bg-[#398b5a] text-white hover:bg-[#276844]`}
                        onClick={() => waterPlant(index)}
                      >
                        Water
                      </button>
                    )}
                    {slot.growthStatus === SeedStatus.READY_TO_HARVEST && (
                      <button
                        className={`mt-2 px-4 py-2 rounded-lg font-semibold transition-colors duration-300 bg-[#398b5a] text-white hover:bg-[#276844]`}
                        onClick={() => harvestPlant(index)}
                      >
                        Harvest
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <button
                  className={`mt-2 px-4 py-2 rounded-lg font-semibold transition-colors duration-300 bg-[#398b5a] text-white hover:bg-[#276844]`}
                  onClick={() => openInventory(index)}
                >
                  Add Seed
                </button>
              )}
            </div>
          ))}
        </div>
        <InventoryPopup
          isOpen={isInventoryOpen}
          onClose={closeInventory}
          onSeedSelect={plantSeedInSlot}
          onWaterSelect={() => {}} // Placeholder for watering logic if needed
        />
      </div>
    </div>
  );
};

export default Farm;
