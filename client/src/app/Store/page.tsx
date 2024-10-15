'use client';

import React, { useEffect, useState } from 'react'; // Importa useState
import { useDispatch, useSelector } from 'react-redux';
import { useGetStoreItemsQuery } from '../../redux/api/store';
import { RootState } from '../../redux/store/store';
import Navbar from 'src/components/Navbar';
import { StoreItem } from 'src/types';
import PurchaseButton from 'src/components/PurchaseButton';
import useSocket from 'src/hooks/useSocket';
import Timer from './Timer';
import { setTimeRemaining } from 'src/redux/slices/timerSlice';
import bgPlant from '../assets/bgplant.jpg';
import Image from 'next/image';
import ItemPopup from './ItemPopup';
import useFetchUser from 'src/hooks/useFetchUser';
import { useAuth0 } from '@auth0/auth0-react';

const StorePage: React.FC = () => {
  const { data: storeItems, refetch: refetchStoreItems } =
    useGetStoreItemsQuery();
  const { user } = useAuth0();
  const {
    fetchedUser,
    fetchError: userError,
    isLoading: userLoading,
  } = useFetchUser(user);
  const userSub = fetchedUser?.sub;

  const socket = useSocket('http://localhost:3002');
  const dispatch = useDispatch();

  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);

  useEffect(() => {
    if (socket) {
      socket.on('storeUpdated', (timeRemaining) => {
        console.log('store update event received:', timeRemaining);
        refetchStoreItems().then((res) => {
          console.log('Updated store items:', res);
        });
        dispatch(setTimeRemaining(timeRemaining));
      });

      return () => {
        socket.off('storeUpdated');
      };
    }
  }, [socket, storeItems]);

  const handleCardClick = async (item: StoreItem) => {
    try {
      const response = await refetchStoreItems();
      const updatedStoreItems = response?.data;

      const updatedItem = updatedStoreItems?.find(
        (storeItem) => storeItem.id === item.id,
      );

      if (updatedItem) {
        setSelectedItem(updatedItem);
      } else {
        setSelectedItem(item);
      }
    } catch (error) {
      console.error('Error al obtener items de la tienda:', error);
    }
  };

  const handleClosePopup = () => {
    setSelectedItem(null);
  };

  if (!storeItems) return <div>Loading...</div>;

  if (!userSub) return <div>Need to login to purchase an item</div>;

  return (
    <div className="min-h-screen bg-[#4d2612]">
      <Navbar />
      <div className="flex flex-col items-center pt-20">
        <h1 className="text-[#fcd9c4] text-3xl font-bold mb-6 text-center mt-16">
          Store Items
        </h1>
        <div className="relative w-full max-w-7xl mx-auto bg-[#FDE8C9] mb-14 rounded-lg border-4 border-[#703517] shadow-lg">
          <Image
            src={bgPlant}
            alt="Store Background"
            fill
            priority
            style={{ objectFit: 'cover' }}
            className="absolute inset-0 z-0 opacity-80 rounded-lg"
          />
          <div className="relative z-10 p-8 flex flex-col items-center">
            <Timer />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 p-4 lg:grid-cols-4 gap-4 mb-6 mt-18">
              {storeItems?.map((item: StoreItem) => (
                <div
                  key={item.id}
                  className="border-4 border-[#C76936] shadow-lg shadow-amber-950 bg-[#fce0c0] p-4 flex flex-col justify-between rounded-lg transition-transform transform hover:scale-105"
                >
                  <h2 className="text-xl font-semibold text-center text-[#8B4513]">
                    {item.name}
                  </h2>
                  <div
                    className="relative rounded-lg overflow-hidden flex items-center justify-center"
                    style={{ minHeight: '250px' }}
                  >
                    {item.img ? (
                      <Image
                        src={`http://localhost:3002${item.img}`}
                        alt={item.name}
                        width={300}
                        height={300}
                        className="absolute w-2/3 h-auto object-contain"
                      />
                    ) : (
                      <div className="absolute w-2/3 h-auto flex justify-center items-center text-gray-500">
                        Sin imagen
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-[#8B4513] font-extrabold text-center">
                    {item.description}
                  </p>
                  <p className="mt-2 text-[#8B4513] font-extrabold text-center">
                    Price: T$
                    <span className="text-amber-600">{item.price}</span>
                  </p>
                  <button
                    className="mt-2 px-4 py-2 rounded-lg font-extrabold transition-colors duration-300 bg-[#C76936] text-[#ffdecc] hover:bg-[#8B4513] mr-4"
                    onClick={() => handleCardClick(item)}
                  >
                    Info
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {selectedItem && (
        <ItemPopup
          key={selectedItem.id}
          item={selectedItem}
          onClose={handleClosePopup}
          userSub={userSub}
          stock={selectedItem.stock}
          refetchStoreItems={refetchStoreItems}
        />
      )}
    </div>
  );
};

export default StorePage;
