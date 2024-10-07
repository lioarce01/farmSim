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
import { Rarity, SeedStatus, Slot } from 'src/types';
import useSocket from 'src/hooks/useSocket';
import Popup from '../../components/PopUp';
import { useAuth0 } from '@auth0/auth0-react';
import { formatGrowthStatus, formatLastWatered } from './formatGrowthStatus';
import FarmSlot from './farmSlot';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/redux/store/store';
import { setGrowthStatus, setSeedRarity } from 'src/redux/slices/filtersSlice';

const Farm = () => {
  const dispatch = useDispatch();
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

  const message =
    filteredSlots.length === 0
      ? 'No slots available with the selected filters.'
      : '';

  const handleSeedRarityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setSeedRarity(e.target.value as Rarity));
  };

  const handleGrowthStatusChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    dispatch(setGrowthStatus(e.target.value as SeedStatus));
  };

  const socket = useSocket('http://localhost:3002');

  console.log('slots:', slots);

  useEffect(() => {
    if (socket) {
      socket.on('seed-planted', () => refetchFarmSlots());
      socket.on('actualizacion-planta', () => refetchFarmSlots());
      socket.on('seed-watered', () => refetchFarmSlots());
      socket.on('seed-harvested', () => refetchFarmSlots());
      socket.on('seed-deleted', () => refetchFarmSlots());

      return () => {
        socket.off('seed-planted');
        socket.off('actualizacion-planta');
        socket.off('seed-watered');
        socket.off('seed-harvested');
        socket.off('seed-deleted');
      };
    }
  }, [socket, refetchFarmSlots]);

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
    <div className="bg-[#4d2612] min-h-screen pt-20">
      <Navbar />
      <div className="flex flex-col items-center xl:w-2/3 mx-auto pt-24 pb-20">
        <h1 className="text-4xl font-bold mb-8 text-[#c76936]">My Farm</h1>

        {/* Contenedor con la imagen de fondo */}
        <div className="relative w-full">
          <Image
            src={bgStore}
            alt="Store Background"
            fill
            style={{ objectFit: 'cover' }}
            className="absolute inset-0 z-0 rounded-lg border-4 opacity-80 border-[#703517] shadow-lg shadow-black"
          />

          {/* Filtros */}
          <div className="relative z-10 flex flex-col mb-8 w-full sm:items-center xl:items-start p-4">
            <div className="flex flex-col md:w-1/2 lg:w-1/3 xl:w-1/4 md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
              <label className="flex flex-col text-lg font-extrabold text-[#f8d7c6]">
                Rarity:
                <select
                  name="rarity"
                  onChange={handleSeedRarityChange}
                  value={seedRarity}
                  className="mt-1 p-2 rounded border border-[#c76936] bg-[#d67947] focus:outline-none focus:ring-2 focus:ring-[#e2824e] transition ease-in-out duration-150"
                >
                  <option value="">All</option>
                  <option value="COMMON">Common</option>
                  <option value="UNCOMMON">Uncommon</option>
                  <option value="RARE">Rare</option>
                  <option value="EPIC">Epic</option>
                  <option value="LEGENDARY">Legendary</option>
                </select>
              </label>
              <label className="flex flex-col text-lg font-extrabold text-[#f8d7c6]">
                Status:
                <select
                  name="growthStatus"
                  value={growthStatus}
                  onChange={handleGrowthStatusChange}
                  className="mt-1 p-2 rounded border border-[#c76936] bg-[#d67947] focus:outline-none focus:ring-2 focus:ring-[#e2824e] transition ease-in-out duration-150"
                >
                  <option value="">All</option>
                  <option value="GROWING">Growing</option>
                  <option value="READY_TO_HARVEST">Ready to harvest</option>
                  <option value="WITHERED">Withered</option>
                  <option value="WATER_NEEDED">Need Water</option>
                </select>
              </label>
            </div>
          </div>

          {/* Grid de los slots */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:px-10 xl:gap-8 sm:w-2/3 md:w-full bg-opacity-90 pb-12 rounded-lg shadow-lg">
            {filteredSlots.length > 0 ? (
              filteredSlots.map((slot: Slot, index: number) => (
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
      </div>
    </div>
  );
};

export default Farm;
