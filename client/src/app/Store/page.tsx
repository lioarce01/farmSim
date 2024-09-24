'use client'

import React, { useEffect, useState } from 'react';
import { useGetStoreItemsQuery } from '../../redux/api/store';
import { StoreItem } from '../../types';

const rarityColors: { [key: string]: string } = {
  common: '#6DBE45', // Verde más vibrante
  uncommon: '#FFA07A', // Salmón claro
  rare: '#FF8C00', // Naranja más intenso
  epic: '#FFD700', // Amarillo dorado
  legendary: '#32CD32' // Verde lima
};

const StorePage: React.FC = () => {
  const { data: storeItems, error, isLoading, refetch } = useGetStoreItemsQuery();
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedTime = localStorage.getItem('timeLeft');
    return savedTime ? parseInt(savedTime) : 60;
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      refetch();
      setTimeLeft(60);
      localStorage.setItem('timeLeft', '60');
    }, 60000);

    const countdownId = setInterval(() => {
      setTimeLeft((prev) => {
        const newTimeLeft = prev > 0 ? prev - 1 : 0;
        localStorage.setItem('timeLeft', newTimeLeft.toString());
        return newTimeLeft;
      });
    }, 1000);

    return () => {
      clearInterval(intervalId);
      clearInterval(countdownId);
    };
  }, [refetch]);

  if (isLoading) return <div>Loading...</div>;

  let errorMessage: string | null = null;
  if (error) {
    if ('status' in error) {
      errorMessage = `Error ${error.status}: ${JSON.stringify(error.data)}`;
    } else {
      errorMessage = 'An unexpected error occurred';
    }
  }

  return (
    <div className="w-full p-4">
      <h1 className="text-4xl font-bold text-[#A8D5BA] mb-8 text-center">Store Items</h1>
      <p className="text-lg text-center mb-4">Refreshing in {timeLeft} seconds...</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {storeItems?.map((item: StoreItem) => (
          <div key={item.id} className="bg-[#FFFAE3] border border-[#FFD700] rounded-lg shadow-lg flex flex-col p-4 transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-[#333]">{item.name}</h2>
            <p className="mt-2 text-gray-700">{item.description}</p>
            <p className="mt-2 text-lg font-bold text-[#398b5a]">Price: {item.price} tokens</p>
            <p className="mt-2 text-sm text-[#333]">Type: {item.itemType}</p> 
            {(item.itemType as unknown as string) !== 'seeds' && item.rarity ? (
              <p className=" mb-2 mt-2 text-sm font-bold" style={{ color: rarityColors[item.rarity.toLowerCase()] }}>
                Rarity: {item.rarity}
              </p>
            ) : null}
            <div className="mt-auto mt-4"> 
              <button className="w-full bg-[#FFC1A1] text-white py-2 rounded-md hover:bg-[#FFB385] transition duration-300">
                Buy
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StorePage;