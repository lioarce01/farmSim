'use client';

import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Info } from 'lucide-react';
import { useGetMarketListingsQuery } from 'src/redux/api/market';
import bgPlant from '../assets/bgplant.jpg';
import { useAuth0 } from '@auth0/auth0-react';
import useFetchUser from 'src/hooks/useFetchUser';
import { useRouter, useSearchParams } from 'next/navigation';
import MarketListingPage from './MarketListingPopup';
import Image from 'next/image';
import LoadingSkeleton from './Skeleton';
import { Pagination } from './Pagination';
import { MarketListing, Rarity } from 'src/types';
import Navbar from 'src/components/Navbar';
import useSocket from 'src/hooks/useSocket';
import CreateListingPopup from './createListingPopup';
import { setSeedRarity, setSortOrder } from 'src/redux/slices/filtersSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/redux/store/store';

const ITEMS_PER_PAGE = 9;

export default function Marketplace() {
  const dispatch = useDispatch();
  const { seedRarity, sortOrder } = useSelector(
    (state: RootState) => state.filters,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listingId') ?? undefined;
  const router = useRouter();

  const {
    data: marketListings = [],
    isLoading,
    isError,
    refetch: refetchMarketListings,
  } = useGetMarketListingsQuery({ rarity: seedRarity, sortBy: sortOrder });

  const { user } = useAuth0();
  const {
    fetchedUser,
    fetchError: userError,
    isLoading: userLoading,
    fetchUserData,
  } = useFetchUser(user);
  const socket = useSocket('http://localhost:3002');

  useEffect(() => {
    if (socket) {
      socket.on('marketListingCreated', refetchMarketListings);
      socket.on('marketListingBought', refetchMarketListings);
      socket.on('marketListingDeleted', refetchMarketListings);

      return () => {
        socket.off('marketListingCreated');
        socket.off('marketListingBought');
        socket.off('marketListingDeleted');
      };
    }
  }, [socket, refetchMarketListings]);

  // const totalPages = Math.ceil(marketListings.length / ITEMS_PER_PAGE);
  // const paginatedListings = marketListings.slice(
  //   (currentPage - 1) * ITEMS_PER_PAGE,
  //   currentPage * ITEMS_PER_PAGE,
  // );

  const filteredListings = marketListings.filter((listing: MarketListing) => {
    const matchesRarity = !seedRarity || listing.seedRarity === seedRarity;
    const matchesPrice = !listing.price || listing.price === listing.price;
    return matchesRarity && matchesPrice;
  });

  const handleOpenPopup = (id: string) => {
    router.push(`/Marketplace?listingId=${id}`);
  };

  const handleClosePopup = () => {
    router.push('/Marketplace');
  };

  const handleRarityChange = (value: Rarity | 'ALL') => {
    dispatch(setSeedRarity(value === 'ALL' ? null : value));
  };

  const handleSortChange = (value: string) => {
    dispatch(setSortOrder(value));
  };

  const handleResetFilters = () => {
    dispatch(setSeedRarity(null));
    dispatch(setSortOrder('desc'));
  };

  if (isLoading || userLoading) {
    return <LoadingSkeleton />;
  }

  if (!fetchedUser?.sub) {
    return (
      <div className="text-center text-xl">
        Log in to access the marketplace
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4 bg-background text-foreground text-white pt-20">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:block w-64 transition-all duration-300 ease-in-out">
            <div className="flex gap-4 flex-col w-full sm:w-auto">
              <header className="mb-8 flex justify-between items-center">
                <h1 className="text-3xl font-bold">Marketplace</h1>
              </header>
              <Select
                name="rarity"
                onValueChange={handleRarityChange}
                value={seedRarity || undefined}
              >
                <SelectTrigger className="w-full sm:w-[180px] bg-[#1a1a25] text-white">
                  <SelectValue placeholder="Select Rarity" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a25] text-white">
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="COMMON">Common</SelectItem>
                  <SelectItem value="UNCOMMON">Uncommon</SelectItem>
                  <SelectItem value="RARE">Rare</SelectItem>
                  <SelectItem value="EPIC">Epic</SelectItem>
                  <SelectItem value="LEGENDARY">Legendary</SelectItem>
                </SelectContent>
              </Select>
              <Select
                name="sortOrder"
                value={sortOrder || 'desc'}
                onValueChange={handleSortChange}
              >
                <SelectTrigger className="w-full sm:w-[180px] bg-[#1a1a25] text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a25] text-white text-center">
                  <SelectItem value="desc">Highest Price</SelectItem>
                  <SelectItem value="asc">Lowest Price</SelectItem>
                </SelectContent>
              </Select>
              <CreateListingPopup
                refetchMarketListings={refetchMarketListings}
              />
            </div>
          </aside>
          <main className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
              <p className="text-md text-muted-foreground">
                Plants: <strong>{marketListings.length}</strong>
              </p>
            </div>
            <ScrollArea className="h-[calc(100vh-200px)] rounded-md border border-[#1f1f2c]">
              {filteredListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {filteredListings.map((item: MarketListing) => (
                    <Card
                      key={item.id}
                      className="transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105 bg-[#1a1a25]"
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {item.seedName}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="aspect-square bg-muted rounded-md mb-4 relative flex items-center justify-center border-2 border-[#2a2a3b] overflow-hidden">
                          <Image
                            src={bgPlant}
                            alt="bgPlant"
                            sizes="50vw"
                            fill
                            priority
                            className="absolute inset-0 rounded-md blur-sm opacity-70 object-cover"
                          />
                          <Image
                            src={item.seedImg || ''}
                            alt={item.seedName || ''}
                            width={200}
                            height={200}
                            className="relative z-10 object-contain w-3/4 h-3/4"
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-2xl font-bold">
                            ${item.price.toFixed(2)}
                          </p>
                          <Badge className="bg-[#222231] text-white">
                            {item.seedRarity || 'Unknown'}
                          </Badge>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full bg-[#222231] hover:bg-[#29293b] text-white transition duration-300"
                          onClick={() => handleOpenPopup(item.id.toString())}
                        >
                          <Info className="mr-2 h-4 w-4" />
                          Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center text-xl p-6">
                  <p>No plants available for sale.</p>
                  <Button onClick={handleResetFilters}>Reset Filters</Button>
                </div>
              )}
            </ScrollArea>
            {/* {marketListings.length > 0 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )} */}
            {listingId && (
              <MarketListingPage
                listingId={listingId}
                onClose={handleClosePopup}
                refetchMarketListings={refetchMarketListings}
              />
            )}
          </main>
        </div>
      </div>
    </>
  );
}
