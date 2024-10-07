'use client';

import React, { useEffect, useState } from 'react';
import useFetchUser from '../../hooks/useFetchUser';
import InventoryPopup from '../../components/Inventory';
import Navbar from '../../components/Navbar';
import {
  useDeletePlantMutation,
  useGetFarmByIdQuery,
  useHarvestPlantMutation,
  usePlantSeedMutation,
  useWaterPlantMutation,
  useGetFarmSlotsQuery,
} from '../../redux/api/farm';
import { Slot } from 'src/types';
import useSocket from 'src/hooks/useSocket';
import Popup from '../../components/PopUp';
import { useAuth0 } from '@auth0/auth0-react';
import { formatGrowthStatus, formatLastWatered } from './formatGrowthStatus';
import FarmSlot from './farmSlot';

const Farm = () => {
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const { user } = useAuth0();
  const {
    fetchedUser,
    fetchError: userError,
    isLoading: userLoading,
  } = useFetchUser(user);
  const [plantSeed, { isLoading: isPlanting }] = usePlantSeedMutation();
  const [waterPlant, { isLoading: isWatering }] = useWaterPlantMutation();
  const [harvestPlant, { isLoading: isHarvesting }] = useHarvestPlantMutation();
  const [deletePlant, { isLoading: isDeleting }] = useDeletePlantMutation();
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [action, setAction] = useState<'plant' | 'water' | null>(null);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    rarity: '',
    growthStatus: '',
    needsWater: false,
  });
  const [filteredSlots, setFilteredSlots] = useState<Slot[]>([]);
  const [message, setMessage] = useState<string>('');

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
    data: slots,
    error: slotError,
    isLoading: isSlotLoading,
    refetch: refetchFarmSlots,
  } = useGetFarmSlotsQuery({ farmId, filters }, { skip: !farmId });

  const socket = useSocket('http://localhost:3002');

  console.log('slots:', slots);

  useEffect(() => {
    if (socket) {
      socket.on('seed-planted', () => refetchFarm());
      socket.on('actualizacion-planta', () => refetchFarm());
      socket.on('seed-watered', () => refetchFarm());
      socket.on('seed-harvested', () => refetchFarm());
      socket.on('seed-deleted', () => refetchFarm());

      return () => {
        socket.off('seed-planted');
        socket.off('actualizacion-planta');
        socket.off('seed-watered');
        socket.off('seed-harvested');
        socket.off('seed-deleted');
      };
    }
  }, [socket, refetchFarm]);

  const handleOpenInventory = (
    slotIndex: number | null = null,
    action: 'plant' | 'water' | null = null,
  ) => {
    setSelectedSlot(slotIndex);
    setAction(action);
    setIsInventoryOpen(true);
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

        await waterPlant(seedData)
          .unwrap()
          .then(() => setShowPopup(true));
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
        const response = await deletePlant(slotData).unwrap();
      } catch (e) {
        const error = e as Error;
        console.error('Error deleting plant:', error.message);
      }
    } else {
    }
  };

  const handleFilterChange = (e: any) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  useEffect(() => {
    const applyFilters = () => {
      if (slots) {
        const filtered = slots.filter((slot: Slot) => {
          const matchesRarity =
            !filters.rarity || slot.seedRarity === filters.rarity;
          const matchesStatus =
            !filters.growthStatus || slot.growthStatus === filters.growthStatus;

          return matchesRarity && matchesStatus;
        });

        setFilteredSlots(filtered);

        if (filtered.length === 0) {
          setMessage('No slots available with the selected filters.');
        } else {
          setMessage('');
        }
      }
    };

    applyFilters();
  }, [filters, slots]);

  if (userLoading)
    return <div className="text-center text-lg">Loading user...</div>;
  if (userError) {
    const errorMessage =
      'status' in userError
        ? `Error ${userError.status}: ${JSON.stringify(userError.data)}`
        : userError.message || 'An unknown error occurred';
    return (
      <div className="text-center text-red-500">
        Error loading user: {errorMessage}
      </div>
    );
  }
  if (farmLoading)
    return <div className="text-center text-lg">Loading farm...</div>;
  if (farmError) {
    const errorMessage =
      'status' in farmError
        ? `Error ${farmError.status}: ${JSON.stringify(farmError.data)}`
        : (farmError as any).message || 'An unknown error occurred';
    return (
      <div className="text-center text-red-500">
        Error loading farm: {errorMessage}
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="flex flex-col items-center xl:w-2/3 mx-auto pt-24">
        <h1 className="text-4xl font-bold mb-8">My Farm</h1>

        {/* Filtros */}
        <div className="flex flex-col mb-8 w-full">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 mb-4">
            <label className="flex flex-col text-lg font-medium">
              Rarity:
              <select
                name="rarity"
                onChange={handleFilterChange}
                className="mt-1 p-2 rounded border border-gray-300 bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-400 transition ease-in-out duration-150"
              >
                <option value="">All</option>
                <option value="COMMON">Common</option>
                <option value="UNCOMMON">Uncommon</option>
                <option value="RARE">Rare</option>
                <option value="EPIC">Epic</option>
                <option value="LEGENDARY">Legendary</option>
              </select>
            </label>
            <label className="flex flex-col text-lg font-medium">
              Status:
              <select
                name="growthStatus"
                onChange={handleFilterChange}
                className="mt-1 p-2 rounded border border-gray-300 bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-400 transition ease-in-out duration-150"
              >
                <option value="">Todos</option>
                <option value="GROWING">Growing</option>
                <option value="READY_TO_HARVEST">Ready to harvest</option>
                <option value="WITHERED">Withered</option>
                <option value="WATER_NEEDED">Need Water</option>
              </select>
            </label>
          </div>
        </div>

        {/* Mensaje para cuando no hay slots con estos filtros */}
        {/* {message && <div className="text-red-500 text-lg mb-4">{message}</div>} */}

        {/* Grid de los slots */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-3 w-full">
          {filteredSlots.length > 0 ? (
            filteredSlots?.map((slot: Slot, index: number) => (
              <div key={index} className="w-full max-w-sm mx-auto">
                <FarmSlot
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
                  filters={{ seedRarity: 'COMMON', growthStatus: 'GROWING' }}
                />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-lg">
              No plants available.
            </div>
          )}
        </div>

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

        {showPopup && (
          <Popup
            message="Plant harvested successfully!"
            onClose={() => setShowPopup(false)}
            isOpen={false}
          />
        )}
      </div>
    </div>
  );
};

export default Farm;
