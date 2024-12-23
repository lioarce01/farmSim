'use client';

import { Button } from 'components/ui/button';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useGetBuySeedMutation } from '../../redux/api/market';

interface BuyListingProps {
  marketListingId: string;
  buyerId: string;
  refetchMarketListings: () => void;
}

const BuyListing: React.FC<BuyListingProps> = ({
  marketListingId,
  buyerId,
}) => {
  const router = useRouter();
  const [buySeed, { isLoading, isError, error }] = useGetBuySeedMutation();

  const handleBuyListing = async () => {
    try {
      await buySeed({ marketListingId, buyerId }).unwrap();
      console.log('Compra exitosa');
      router.push('/Marketplace');
    } catch (err) {
      console.error('Error al comprar:', err);
    }
  };
  return (
    <div>
      <Button
        className="bg-[#222231] hover:bg-[#29293b] text-white transition duration-300 ease-in-out"
        onClick={handleBuyListing}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Buy Now'}
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

export default BuyListing;
