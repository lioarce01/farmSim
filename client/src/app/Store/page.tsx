'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useGetStoreItemsQuery } from '../../redux/api/store';
import Navbar from 'src/components/Navbar';
import { StoreItem } from 'src/types';
import useSocket from 'src/hooks/useSocket';
import Timer from './Timer';
import { setTimeRemaining } from 'src/redux/slices/timerSlice';
import bgPlant from '../assets/bgplant.jpg';
import Image from 'next/image';
import ItemPopup from './ItemPopup';
import useFetchUser from 'src/hooks/useFetchUser';
import { useAuth0 } from '@auth0/auth0-react';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Info } from 'lucide-react';
import { ScrollArea } from '../../../components/ui/scroll-area';

export default function StorePage() {
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
  }, [socket, storeItems, dispatch, refetchStoreItems]);

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

  if (!storeItems)
    return <div className="text-center text-xl text-white">Loading...</div>;

  if (!userSub)
    return (
      <div className="text-center text-xl text-white">
        Need to login to purchase an item
      </div>
    );

  return (
    <div className="min-h-screen bg-[#14141b] text-white">
      <Navbar />
      <div className="container mx-auto p-4 pt-14">
        <h1 className="text-3xl font-bold mb-6 text-center mt-16">
          Store Items
        </h1>
        <div className="relative w-full max-w-7xl mx-auto bg-[#1a1a25] mb-14 rounded-lg border border-[#2a2a3b] shadow-lg overflow-hidden">
          <Image
            src={bgPlant}
            alt="Store Background"
            fill
            priority
            style={{ objectFit: 'cover' }}
            className="absolute inset-0 z-0 opacity-20"
          />
          <div className="relative z-10 p-8 flex flex-col items-center">
            <Timer />

            <ScrollArea className="h-[calc(100vh-300px)] w-full rounded-md border border-[#2a2a3b]">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
                {storeItems?.map((item: StoreItem) => (
                  <Card
                    key={item.id}
                    className="bg-[#14141b] border-[#2a2a3b] transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg text-center">
                        {item.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-square bg-muted rounded-md mb-4 relative flex items-center justify-center border border-[#2a2a3b] overflow-hidden">
                        <Image
                          src={bgPlant}
                          alt="bgPlant"
                          fill
                          priority
                          className="absolute inset-0 rounded-md blur-sm opacity-30 object-cover"
                        />
                        {item.img ? (
                          <Image
                            src={item.img}
                            alt={item.name}
                            width={200}
                            height={200}
                            className="relative z-10 object-contain w-3/4 h-3/4"
                          />
                        ) : (
                          <div className="relative z-10 text-gray-500">
                            No image
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-center mb-2">
                        {item.description}
                      </p>
                      <p className="text-xl font-bold text-center">
                        T${item.price}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full bg-[#1a1a25] text-white hover:bg-[#262630] transition duration-300"
                        onClick={() => handleCardClick(item)}
                      >
                        <Info className="mr-2 h-4 w-4" />
                        Info
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
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
}
