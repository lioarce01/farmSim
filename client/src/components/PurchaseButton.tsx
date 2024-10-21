'use client';

import React, { useState } from 'react';
import {
  useGetStoreBuyMutation,
  useGetStoreItemByIdQuery,
} from '../redux/api/store';
import { ItemType, PurchaseButtonProps } from 'src/types';
import { useGetUserBySubQuery } from 'src/redux/api/users';
import useFetchUser from 'src/hooks/useFetchUser';
import { Button } from '../../components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';

export default function PurchaseButton({
  userSub,
  itemId,
  quantity,
  itemType: propItemType,
  stock,
  price,
}: PurchaseButtonProps) {
  const [buyItem, { isLoading: isBuying }] = useGetStoreBuyMutation();
  const { data: user } = useGetUserBySubQuery(userSub);
  const { refetch: refetchItem } = useGetStoreItemByIdQuery(itemId);
  const { fetchUserData } = useFetchUser(user);

  const [purchaseQuantity] = useState<number>(quantity || 1);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [popupMessage, setPopupMessage] = useState<string>('');
  const derivedItemType: ItemType =
    purchaseQuantity > 0 ? ItemType.seed : ItemType.water;

  const handleBuy = async () => {
    if (user && user.balanceToken !== undefined) {
      if (user.balanceToken < price) {
        setPopupMessage('Insufficient balance.');
        setShowPopup(true);
        return;
      }
    }

    if (purchaseQuantity > stock) {
      setPopupMessage('Quantity exceeds available stock.');
      setShowPopup(true);
      return;
    }

    try {
      await buyItem({
        userSub,
        itemId,
        quantity: purchaseQuantity,
        itemType: propItemType || derivedItemType,
      }).unwrap();

      refetchItem();

      console.log('Purchase successful');
    } catch (err) {
      console.error('Error making purchase', err);
      setPopupMessage('Error making purchase. Please try again.');
      setShowPopup(true);
    }
  };

  return (
    <>
      <Button
        onClick={handleBuy}
        disabled={isBuying || stock <= 0}
        className="w-full bg-[#232331] text-white hover:bg-[#2a2a3b] transition duration-300"
      >
        {isBuying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {stock <= 0 ? 'Out of Stock' : isBuying ? 'Buying...' : 'Buy'}
      </Button>

      <AlertDialog open={showPopup} onOpenChange={setShowPopup}>
        <AlertDialogContent className="bg-[#14141b] border border-[#2a2a3b] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Purchase Error</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              {popupMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setShowPopup(false)}
              className="bg-[#1a1a25] text-white hover:bg-[#262630]"
            >
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
