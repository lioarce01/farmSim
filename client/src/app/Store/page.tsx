'use client'

import React, { useEffect, useState } from 'react';
import { useGetStoreItemsQuery, useGetRemainingTimeQuery } from '../../redux/api/store';
import { StoreItem } from '../../types';

const rarityColors: { [key: string]: string } = {
  common: '#6DBE45',
  uncommon: '#FFA07A',
  rare: '#FF8C00',
  epic: '#FFD700',
  legendary: '#32CD32'
};

const StorePage: React.FC = () => {
  const { data: storeItems, error: itemsError, isLoading: itemsLoading, refetch: refetchItems } = useGetStoreItemsQuery();
  const { data: remainingTimeData, error: timeError, isLoading: timeLoading } = useGetRemainingTimeQuery();
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedTime = localStorage.getItem('timeLeft');
    return savedTime ? parseInt(savedTime) : 0; // Inicializa en 0
  });

  // Efecto para actualizar el tiempo restante y los ítems
  useEffect(() => {
    if (remainingTimeData) {
      const remainingMilliseconds = remainingTimeData.timeRemainingInMs; // Asegúrate de que este campo exista
      setTimeLeft(remainingMilliseconds / 1000); // Convertir a segundos
      localStorage.setItem('timeLeft', (remainingMilliseconds / 1000).toString());

      // Refrescar ítems de la tienda después de actualizar el tiempo
      const refreshItemsInterval = setTimeout(() => {
        refetchItems();
      }, remainingMilliseconds);

      return () => clearTimeout(refreshItemsInterval);
    }
  }, [remainingTimeData, refetchItems]);

  // Efecto para el countdown
  useEffect(() => {
    const countdownId = setInterval(() => {
      setTimeLeft((prev) => {
        const newTimeLeft = prev > 0 ? prev - 1 : 0;
        localStorage.setItem('timeLeft', newTimeLeft.toString());
        return newTimeLeft;
      });
    }, 1000);

    return () => {
      clearInterval(countdownId);
    };
  }, []);

  if (itemsLoading || timeLoading) return <div>Loading...</div>;

  let errorMessage: string | null = null;
  if (itemsError) {
    if ('status' in itemsError) {
      errorMessage = `Error ${itemsError.status}: ${JSON.stringify(itemsError.data)}`;
    } else {
      errorMessage = 'An unexpected error occurred';
    }
  }

  if (timeError) {
    console.error('Error fetching remaining time:', timeError);
    errorMessage = 'Error fetching remaining time.';
  }

  return (
    <div className="w-full p-4">
      <h1 className="text-4xl font-bold text-[#A8D5BA] mb-8 text-center">Store Items</h1>
      <p className="text-lg text-center mb-4">Refreshing in {Math.floor(timeLeft)} seconds...</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {storeItems?.map((item: StoreItem) => (
          <div key={item.id} className="bg-[#FFFAE3] border border-[#FFD700] rounded-lg shadow-lg flex flex-col p-4 transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-[#333]">{item.name}</h2>
            <p className="mt-2 text-gray-700">{item.description}</p>
            <p className="mt-2 text-lg font-bold text-[#398b5a]">Price: {item.price} tokens</p>
            <p className="mt-2 mb-2 text-sm text-[#333]">Type: {item.itemType}</p> 
            {(item.itemType as unknown as string) !== 'seeds' && item.rarity ? (
              <p className=" mb-2 mt-2 text-sm font-bold" style={{ color: rarityColors[item.rarity.toLowerCase()] }}>
                Rarity: {item.rarity}
              </p>
            ) : null}
            <div className="mt-auto"> 
              <button className="w-full bg-[#FFC1A1] text-white py-2 rounded-md hover:bg-[#FFB385] transition duration-300">
                Buy
              </button>
            </div>
          </div>
        ))}
      </div>
      {errorMessage && <p className="text-red-500 text-center mt-4">{errorMessage}</p>}
    </div>
  );
};

export default StorePage;