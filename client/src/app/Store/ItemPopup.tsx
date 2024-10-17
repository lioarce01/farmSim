'use client';

import React, { useEffect } from 'react';
import { StoreItem } from 'src/types';
import PurchaseButton from 'src/components/PurchaseButton';
import { useAuth0 } from '@auth0/auth0-react';
import { useGetStoreItemByIdQuery } from 'src/redux/api/store';
import { X } from 'lucide-react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';

interface ItemPopupProps {
  item: StoreItem;
  onClose: () => void;
  userSub: string;
  stock: number;
  refetchStoreItems: () => void;
}

export default function ItemPopup({
  item,
  onClose,
  userSub,
  refetchStoreItems,
}: ItemPopupProps) {
  const { data: updatedItem, refetch: refetchItem } = useGetStoreItemByIdQuery(
    item.id,
  );

  const rarityColors: { [key: string]: string } = {
    common: 'bg-gray-500',
    uncommon: 'bg-green-500',
    rare: 'bg-blue-500',
    epic: 'bg-purple-500',
    legendary: 'bg-yellow-500',
  };

  useEffect(() => {
    refetchItem();
  }, [refetchItem]);

  const itemData = updatedItem || item;

  if (!userSub)
    return (
      <div className="text-center text-xl text-white">
        Need to login to purchase.
      </div>
    );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#1a1a25] text-white border-[#1a1a25]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {itemData.name}
          </DialogTitle>
          <Button
            variant="ghost"
            className="absolute right-4 top-4 rounded-full p-2 hover:bg-[#262630]"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="relative rounded-lg overflow-hidden flex items-center justify-center mb-4 border border-[#2a2a3b] bg-[#1a1a25] aspect-square">
          {itemData.img ? (
            <Image
              src={itemData.img}
              alt={itemData.name}
              width={200}
              height={200}
              className="object-contain"
            />
          ) : (
            <div className="flex justify-center items-center text-gray-500">
              No image
            </div>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Stock: <span className="font-bold">{itemData.stock}</span>
          </p>
          <p className="text-xl font-bold">Price: T$ {itemData.price}</p>
          {(itemData.itemType as unknown as string) !== 'seeds' &&
            itemData.rarity && (
              <Badge
                className={`${rarityColors[itemData.rarity.toLowerCase()]} text-white`}
              >
                {itemData.rarity}
              </Badge>
            )}
        </div>
        {itemData.description && (
          <p className="text-sm text-gray-400 italic">{itemData.description}</p>
        )}
        <div className="flex justify-center mt-4">
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
      </DialogContent>
    </Dialog>
  );
}
