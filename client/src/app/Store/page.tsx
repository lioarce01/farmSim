'use client';

import React, { useEffect } from 'react';
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

const rarityColors: { [key: string]: string } = {
  common: '#6c6d70',
  uncommon: '#808080',
  rare: '#0000ff',
  epic: '#800080',
  legendary: '#ffd700',
};

const StorePage: React.FC = () => {
  const { data: storeItems, refetch: refetchStoreItems } =
    useGetStoreItemsQuery();
  const userSub = useSelector((state: RootState) => state.user.sub);

  const socket = useSocket('http://localhost:3002');
  const dispatch = useDispatch();

  useEffect(() => {
    if (socket) {
      socket.on('storeUpdated', (timeRemaining) => {
        console.log('store update event received:', timeRemaining);
        refetchStoreItems();
        dispatch(setTimeRemaining(timeRemaining));
      });

      return () => {
        socket.off('storeUpdated');
      };
    }
  }, [socket, storeItems]);

  if (!storeItems) return <div>Loading...</div>;

  if (!userSub) return <div>need to login to purchase an item</div>;

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
                  <p className="mt-2 text-[#8B4513] font-extrabold">
                    Stock: {item.stock}
                  </p>
                  <p className="mt-2 text-lg font-extrabold text-[#8B4513]">
                    Price: T$ {item.price}
                  </p>
                  {(item.itemType as unknown as string) !== 'seeds' &&
                  item.rarity ? (
                    <p className="mb-2 mt-2 text-sm font-extrabold text-[#8B4513] flex">
                      Rarity:
                      <span
                        style={{
                          color: rarityColors[item.rarity.toLowerCase()],
                          marginLeft: '0.5rem',
                        }}
                      >
                        {item.rarity}
                      </span>
                    </p>
                  ) : null}
                  <div className="mt-auto flex items-center justify-center">
                    <PurchaseButton
                      userSub={userSub}
                      itemId={item.id}
                      quantity={1}
                      itemType={item.itemType}
                      stock={item.stock}
                      refetchStoreItems={refetchStoreItems}
                      price={item.price}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorePage;
