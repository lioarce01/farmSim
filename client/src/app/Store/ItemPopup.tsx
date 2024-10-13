'use client';

import React, { useEffect, useState } from 'react';
import { StoreItem } from 'src/types';
import PurchaseButton from 'src/components/PurchaseButton';
import useFetchUser from 'src/hooks/useFetchUser';
import { useAuth0 } from '@auth0/auth0-react';
import { FaTimes } from 'react-icons/fa';
import { useGetFarmByIdQuery } from 'src/redux/api/farm';
import { useGetStoreItemByIdQuery } from 'src/redux/api/store';

interface ItemPopupProps {
  item: StoreItem;
  onClose: () => void;
  userSub: string;
  stock: number;
  refetchStoreItems: () => void;
}

const ItemPopup: React.FC<ItemPopupProps> = ({
  item,
  onClose,
  userSub,
  refetchStoreItems,
}) => {
  const { data: updatedItem, refetch: refetchItem } = useGetStoreItemByIdQuery(
    item.id,
  );

  console.log('Popup item:', updatedItem);

  const rarityColors: { [key: string]: string } = {
    common: '#6c6d70',
    uncommon: '#808080',
    rare: '#0000ff',
    epic: '#800080',
    legendary: '#ffd700',
  };

  useEffect(() => {
    refetchItem();
  }, [refetchItem]);

  const itemData = updatedItem || item;

  if (!userSub) return <div>Need to login to purchase.</div>;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-[#2b231b] p-6 rounded-lg shadow-lg w-11/12 max-w-md border-4 border-[#8B4513]">
        <div className=" flex justify-between">
          <h2 className="text-3xl font-extrabold text-center text-[#FFD700] mb-4">
            {itemData.name}
          </h2>
          <button
            className="text-[#FFD700] p-2 rounded hover:bg-[#703517] transition duration-300 mb-4"
            onClick={onClose}
          >
            <FaTimes size={24} />
          </button>
        </div>
        <div className="relative rounded-lg overflow-hidden flex items-center justify-center mb-4 border-2 border-[#C76936] p-2 bg-[#3e342a]">
          {itemData.img ? (
            <img
              src={`http://localhost:3002${itemData.img}`}
              alt={itemData.name}
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
            Stock: <span className="font-extrabold">{itemData.stock}</span>
          </p>
          <p className="text-lg font-extrabold text-[#FFD700]">
            Price: T$ {itemData.price}
          </p>
          {(itemData.itemType as unknown as string) !== 'seeds' &&
          itemData.rarity ? (
            <p className="mt-2 text-sm font-extrabold text-[#FFD700]">
              Rarity:{' '}
              <span
                style={{ color: rarityColors[itemData.rarity.toLowerCase()] }}
              >
                {itemData.rarity}
              </span>
            </p>
          ) : null}
        </div>
        {itemData.description && (
          <p className="text-[#C76936] italic mb-4">{itemData.description}</p>
        )}

        <div className="flex items-center justify-center">
          <div className="flex justify-between items-center mb-4">
            <PurchaseButton
              userSub={userSub}
              itemId={itemData.id}
              quantity={1}
              itemType={itemData.itemType}
              stock={itemData.stock}
              price={itemData.price}
              refetchStoreItems={refetchStoreItems}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemPopup;
