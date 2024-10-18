'use client';

import { Button } from 'components/ui/button';
import { useRouter } from 'next/navigation';
import React from 'react';
import {
  useCreateMarketListingMutation,
  useGetBuySeedMutation,
} from '../../redux/api/market';

interface CreateListingProps {
  marketListingId: string;
  sellerId: string;
  seedId: string;
  price: number;
  refetchMarketListings: () => void;
}

const CreateListing: React.FC<CreateListingProps> = ({
  sellerId,
  seedId,
  price,
}) => {
  const router = useRouter();
  const [createMarketListing, { isLoading, isError, error }] =
    useCreateMarketListingMutation();

  const handleCreateListing = async () => {
    try {
      await createMarketListing({ price, sellerId, seedId }).unwrap();
      console.log('Market Listing created');
      router.push('/Marketplace');
    } catch (err) {
      console.error('Error creating market listing:', err);
    }
  };
  return (
    <div>
      <Button
        className="bg-[#222231] hover:bg-[#29293b] text-white transition duration-300 ease-in-out"
        onClick={handleCreateListing}
        disabled={isLoading}
      >
        Create Listing
      </Button>
      {isError && (
        <p className="text-red-500">
          Error:{' '}
          {error instanceof Error && 'message' in error
            ? error.message
            : 'Ocurrió un error'}
        </p>
      )}
    </div>
  );
};

export default CreateListing;
