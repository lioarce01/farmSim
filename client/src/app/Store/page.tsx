'use client'

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

const rarityColors: { [key: string]: string } = {
  common: '#6c6d70', // text-gray-700
  uncommon: '#808080', // text-gray-500
  rare: '#0000ff', // text-blue-600
  epic: '#800080', // text-purple-600
  legendary: '#ffd700' // text-yellow-500
};

const StorePage: React.FC = () => {
  const { data: storeItems, refetch: refetchStoreItems } = useGetStoreItemsQuery();
  const userSub = useSelector((state: RootState) => state.user.sub)
  const socket = useSocket('http://localhost:3002'); 
  const dispatch = useDispatch()
  useEffect(() => {
    if(socket) {
      socket.on('storeUpdated', (timeRemaining) => {
        console.log('store update event received:', timeRemaining);
        refetchStoreItems()
        dispatch(setTimeRemaining(timeRemaining))
      })

      return () => {
        socket.off('storeUpdated')
      }
    }

  }, [socket, storeItems]) 

  if (!storeItems) return <div>Loading...</div>;

  if (!userSub) return <div>Please log in to make a purchase.</div>

  return (
    <div className="bg-[#FFF5D1] min-h-screen">
      <Navbar />
      <div className="p-4 sm:p-8" style={{ paddingTop: '120px' }}>
        <h1 className="text-[#172c1f] text-3xl font-bold mb-6 text-center">Store Items</h1>
        <Timer/>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6 mt-18">
          {storeItems?.map((item: StoreItem) => (
            <div
              key={item.id}
              className="border-4 border-[#FFB385] bg-[#FDE8C9] p-4 flex flex-col justify-between rounded-lg shadow-lg transition-transform transform hover:scale-105"
            >
              <h2 className="text-xl font-semibold text-[#333]">{item.name}</h2>
              <p className="mt-2 text-gray-700">{item.description}</p>
              <p className="mt-2 text-gray-700">Stock: {item.stock}</p>
              <p className="mt-2 text-lg font-bold text-[#398b5a]">
                Price: {item.price} tokens
              </p>
              <p className="mt-2 mb-2 text-sm text-[#333]">Type: {item.itemType}</p>
              {item.itemType as unknown as string !== 'seeds' && item.rarity ? (
                <p
                  className="mb-2 mt-2 text-sm font-bold"
                  style={{ color: rarityColors[item.rarity.toLowerCase()] }}
                >
                  Rarity: {item.rarity}
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
  );
}

export default StorePage;