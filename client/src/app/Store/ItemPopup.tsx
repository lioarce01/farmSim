'use client';

import React, { useEffect } from 'react';
import { StoreItem } from 'src/types';
import PurchaseButton from 'src/components/PurchaseButton';
import useFetchUser from 'src/hooks/useFetchUser';
import { useAuth0 } from '@auth0/auth0-react';
import { FaTimes } from 'react-icons/fa'; // Importa el ícono de "X"

interface ItemPopupProps {
  item: StoreItem;
  onClose: () => void;
  userSub: string;
  refetchStoreItems: () => void;
}

const ItemPopup: React.FC<ItemPopupProps> = ({
  item,
  onClose,
  userSub,
  refetchStoreItems,
}) => {
  const { user } = useAuth0();
  const { fetchedUser } = useFetchUser(user);

  const rarityColors: { [key: string]: string } = {
    common: '#6c6d70',
    uncommon: '#808080',
    rare: '#0000ff',
    epic: '#800080',
    legendary: '#ffd700',
  };

  useEffect(() => {
    refetchStoreItems();
  }, [refetchStoreItems]);

  if (!userSub) return <div>Need to login to purchase.</div>;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-[#2b231b] p-6 rounded-lg shadow-lg w-11/12 max-w-md border-4 border-[#8B4513]">
        <div className=" flex justify-between">
          <h2 className="text-3xl font-extrabold text-center text-[#FFD700] mb-4">
            {item.name}
          </h2>
          <button
            className="text-[#FFD700] p-2 rounded hover:bg-[#703517] transition duration-300 mb-4"
            onClick={onClose}
          >
            <FaTimes size={24} />
          </button>
        </div>
        <div className="relative rounded-lg overflow-hidden flex items-center justify-center mb-4 border-2 border-[#C76936] p-2 bg-[#3e342a]">
          {item.img ? (
            <img
              src={`http://localhost:3002${item.img}`}
              alt={item.name}
              className="object-contain"
            />
          ) : (
            <div className="flex justify-center items-center text-gray-500">
              Sin imagen
            </div>
          )}
        </div>
        <div className="mb-4">
          <p className="text-[#FFD700] font-semibold">
            Stock: <span className="font-extrabold">{item.stock}</span>
          </p>
          <p className="text-lg font-extrabold text-[#FFD700]">
            Price: T$ {item.price}
          </p>
          {(item.itemType as unknown as string) !== 'seeds' && item.rarity ? (
            <p className="mt-2 text-sm font-extrabold text-[#FFD700]">
              Rarity:{' '}
              <span style={{ color: rarityColors[item.rarity.toLowerCase()] }}>
                {item.rarity}
              </span>
            </p>
          ) : null}
        </div>
        {item.description && (
          <p className="text-[#C76936] italic mb-4">{item.description}</p>
        )}

        <div className="flex items-center justify-center">
          <div className="flex justify-between items-center mb-4">
            <PurchaseButton
              userSub={userSub}
              itemId={item.id}
              quantity={1}
              itemType={item.itemType}
              stock={item.stock}
              price={item.price}
              refetchStoreItems={refetchStoreItems}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemPopup;
