'use client';

import { useParams, useRouter } from 'next/navigation';
import { useGetMarketListingByIdQuery } from 'src/redux/api/market';
import BuyListing from './buyListing';
import useFetchUser from 'src/hooks/useFetchUser';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import Image from 'next/image';
import bgPlant from '../assets/bgplant.jpg';
import { Star, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useGetUserBySubQuery } from 'src/redux/api/users';
import RemoveListing from './removeListing';
import { formatDistanceToNow } from 'date-fns';

interface MarketListingPageProps {
  listingId: string;
  onClose: () => void;
  refetchMarketListings: () => void;
}

const rarityColors: { [key: string]: string } = {
  common: '#6c6d70',
  uncommon: '#808080',
  rare: '#0000ff',
  epic: '#800080',
  legendary: '#ffd700',
};

export default function MarketListingPage({
  listingId,
  onClose,
  refetchMarketListings,
}: MarketListingPageProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  const { user } = useAuth0();
  const { fetchedUser } = useFetchUser(user);
  const {
    data: listing,
    isLoading,
    isError,
  } = useGetMarketListingByIdQuery(listingId);
  const sellerSub = listing?.sellerSub;
  const { data: owner } = useGetUserBySubQuery(sellerSub);
  console.log('owner:', owner);

  useEffect(() => {
    setIsVisible(true);
    return () => setIsVisible(false);
  }, []);

  if (isLoading) return <div>Cargando...</div>;
  if (isError) return <div>Error al cargar el listado</div>;
  if (!listing) return <div>Listado no encontrado</div>;

  const handleCloseListing = () => {
    setIsVisible(false);
    setTimeout(() => {
      router.back();
    }, 300);
  };

  const formattedDate = formatDistanceToNow(new Date(listing.listedAt), {
    addSuffix: true,
  });

  return (
    <div
      className={`backdrop-blur-sm fixed z-10 inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div
        className={`w-full max-w-md mx-auto transition-all duration-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        <Card className="bg-[#14141b] relative w-full mx-auto">
          <Button
            className="absolute top-2 right-2 bg-transparent hover:bg-[#262630] text-[#e4e4e4]"
            onClick={handleCloseListing}
          >
            <X size={24} />
          </Button>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl md:text-3xl">
              {listing.seedName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-square bg-muted rounded-md relative flex items-center justify-center border-2 border-[#2a2a3b] overflow-hidden">
              <Image
                src={bgPlant}
                alt="bgPlant"
                fill
                priority
                sizes="50vw"
                className="absolute inset-0 rounded-md blur-sm opacity-70 object-cover"
              />
              <Image
                src={listing.seedImg || ''}
                alt={listing.seedName || ''}
                width={200}
                height={200}
                className="relative z-10 object-contain w-3/4 h-3/4 "
              />
            </div>
            <div className="space-y-3 py-1 transition-all duration-500 ease-in-out">
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold">
                ${listing.price}
              </p>
              <p className="text-gray-600">Listed: {formattedDate}</p>
              <p
                className="text-sm flex items-center"
                style={{
                  color: rarityColors[listing.seedRarity?.toLowerCase() || ''],
                }}
              >
                <Star className="w-4 h-4 mr-1 inline" fill="currentColor" />
                <strong>{listing.seedRarity}</strong>
              </p>
              <p className="">
                Owner: <strong>{owner?.nickname}</strong>
              </p>
              <p className="">
                Yield: <strong>{listing.seedTokensGenerated}</strong> Tokens per
                harvest
              </p>
              <p className="text-sm sm:text-base">{listing.seedDescription}</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            {fetchedUser?.id && (
              <div className="w-full flex flex-row justify-between">
                <BuyListing
                  marketListingId={listingId}
                  buyerId={fetchedUser.id.toString()}
                  refetchMarketListings={refetchMarketListings}
                />
                <RemoveListing
                  marketListingId={listingId}
                  sellerId={fetchedUser.id.toString()}
                  refetchMarketListings={refetchMarketListings}
                />
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
