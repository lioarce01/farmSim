'use client';

import React, { useState } from 'react';
import { useGetStoreBuyMutation } from '../redux/api/store';
import { ItemType, PurchaseButtonProps } from 'src/types';
import { useGetUserBySubQuery } from 'src/redux/api/users';
import Popup from './PopUp';

const PurchaseButton: React.FC<PurchaseButtonProps> = ({
  userSub,
  itemId,
  quantity,
  itemType: propItemType,
  stock,
  price,
  refetchStoreItems, // Modificar este callback para pasar el nuevo stock
}) => {
  const [buyItem, { isLoading: isBuying, error }] = useGetStoreBuyMutation();
  const { data: user, refetch } = useGetUserBySubQuery(userSub);

  const [purchaseQuantity, setPurchaseQuantity] = useState<number>(
    quantity || 1,
  );
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const derivedItemType: ItemType =
    purchaseQuantity > 0 ? ItemType.seed : ItemType.water;

  const handleBuy = async () => {
    if (user && user?.balanceToken !== undefined) {
      if (user.balanceToken < price) {
        setShowPopup(true);
        return;
      }
    }

    try {
      const response = await buyItem({
        userSub,
        itemId,
        quantity: purchaseQuantity,
        itemType: propItemType || derivedItemType,
      }).unwrap();

      refetch();
      refetchStoreItems();

      console.log('Compra exitosa', response);
    } catch (err) {
      console.error('Error al realizar la compra', err);
    }
  };

  return (
    <>
      <button
        onClick={handleBuy}
        disabled={isBuying || stock <= 0}
        className={`mt-2 px-4 py-2 rounded-lg font-semibold transition-colors duration-300 bg-[#C76936] text-white hover:bg-[#8B4513] ${
          isBuying || stock <= 0
            ? 'bg-[#fac59e] text-white cursor-not-allowed'
            : 'bg-[#C76936] text-white hover:bg-[#8B4513]'
        }`}
      >
        {stock <= 0 ? 'No Stock' : isBuying ? 'Buying...' : 'Buy'}
      </button>

      {showPopup && (
        <Popup
          message="Not enough balance."
          onClose={() => setShowPopup(false)}
          isOpen={showPopup}
        />
      )}
    </>
  );
};

export default PurchaseButton;
