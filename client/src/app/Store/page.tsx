'use client'

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetStoreItemsQuery, useGetRemainingTimeQuery } from '../../redux/api/store';
import { RootState } from '../../redux/store/store';
import { setTimeRemaining, decrementTime } from '../../redux/slices/timerSlice';
import Navbar from 'src/components/Navbar';
import { StoreItem } from 'src/types';
import PurchaseButton from 'src/components/PurchaseButton';

const rarityColors: { [key: string]: string } = {
  common: '#6DBE45',
  uncommon: '#FFA07A',
  rare: '#FF8C00',
  epic: '#FFD700',
  legendary: '#32CD32'
};

const StorePage: React.FC = () => {
  const dispatch = useDispatch();
  const { data: storeItems, refetch: refetchStoreItems } = useGetStoreItemsQuery();
  const { data: remainingTimeData, refetch: refetchRemainingTime } = useGetRemainingTimeQuery();
  const timeRemaining = useSelector((state: RootState) => state.timer.timeRemaining);
  const userSub = useSelector((state: RootState) => state.user.sub)

  // Efecto para sincronizar el temporizador con el backend cada vez que se obtenga un nuevo tiempo restante
  useEffect(() => {
    if (remainingTimeData?.timeRemainingInMs) {
      const remainingTime = Math.floor(remainingTimeData.timeRemainingInMs / 1000); // Convertir ms a segundos
      dispatch(setTimeRemaining(remainingTime));
    }
  }, [remainingTimeData, dispatch]);

  // Efecto para manejar la cuenta regresiva del temporizador
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (timeRemaining > 0) {
        dispatch(decrementTime());
      } else if (timeRemaining === 0) {
        // Si el temporizador llega a 0, hacer refetch de los items y el tiempo restante
        refetchStoreItems();  // Refrescar los items
        refetchRemainingTime();  // Actualizar el tiempo restante desde el backend
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeRemaining, refetchStoreItems, refetchRemainingTime, dispatch]);

  // Efecto para reiniciar el temporizador después de hacer refetch
  useEffect(() => {
    if (remainingTimeData?.timeRemainingInMs) {
      const remainingTime = Math.floor(remainingTimeData.timeRemainingInMs / 1000); // Reiniciar el temporizador
      dispatch(setTimeRemaining(remainingTime));
    }
  }, [storeItems, remainingTimeData, dispatch]);

  if (!storeItems) return <div>Loading...</div>;

  if (!userSub) return <div>Please log in to make a purchase.</div>

  return (
    <>
      <Navbar />
      <div className="pt-24 w-full p-4">
        <h1 className="text-4xl font-bold text-[#A8D5BA] mb-8 text-center">Store Items</h1>
        <p className="text-lg text-center mb-4">
          Refreshing in {timeRemaining > 0 ? timeRemaining : 0} seconds...
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {storeItems?.map((item: StoreItem) => (
            <div
              key={item.id}
              className="bg-[#FFFAE3] border border-[#FFD700] rounded-lg shadow-lg flex flex-col p-4 transition-shadow duration-300"
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
              <div className="mt-auto">
                <PurchaseButton
                  userSub={userSub}
                  itemId={item.id}
                  quantity={1} // Cantidad fija de 1, puedes ajustarlo según el caso
                  itemType={item.itemType}
                  stock={item.stock}
                  refetchStoreItems={refetchStoreItems}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default StorePage;