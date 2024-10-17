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
import { Info, Menu, Star } from 'lucide-react';
import { useGetMarketListingsQuery } from 'src/redux/api/market';
import bgPlant from '../assets/bgplant.jpg';
import { useAuth0 } from '@auth0/auth0-react';
import useFetchUser from 'src/hooks/useFetchUser';
import { useRouter, useSearchParams } from 'next/navigation';
import MarketListingPage from './MarketListingPopup';
import Image from 'next/image';
import LoadingSkeleton from './Skeleton';
import { Pagination } from './Pagination';
import { Rarity } from 'src/types';

const rarityColors = {
  [Rarity.LEGENDARY]: 'bg-yellow-500',
  [Rarity.EPIC]: 'bg-purple-600',
  [Rarity.RARE]: 'bg-blue-600',
  [Rarity.UNCOMMON]: 'bg-gray-500',
  [Rarity.COMMON]: 'bg-gray-700',
};

const ITEMS_PER_PAGE = 9;

export default function Marketplace() {
  const [sortBy, setSortBy] = useState('name');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const {
    data: marketListings,
    isLoading,
    isError,
    refetch: refetchMarketListings,
  } = useGetMarketListingsQuery();
  const { user } = useAuth0();
  const {
    fetchedUser,
    fetchError: userError,
    isLoading: userLoading,
    fetchUserData,
  } = useFetchUser(user);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortedListings, setSortedListings] = useState(marketListings);
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listingId');

  useEffect(() => {
    if (marketListings) {
      let filtered = marketListings;
      if (selectedRarity !== 'all') {
        filtered = marketListings.filter(
          (item) => item.seedRarity?.toLowerCase() === selectedRarity,
        );
      }
      const sorted = [...filtered].sort((a, b) => {
        if (sortBy === 'name')
          return (a.seedName ?? '').localeCompare(b.seedName ?? '');
        if (sortBy === 'lowToHigh') return a.price - b.price;
        if (sortBy === 'highToLow') return b.price - a.price;
        return 0;
      });
      setSortedListings(sorted);
      setCurrentPage(1);
    }
  }, [marketListings, sortBy, selectedRarity]);

  const totalPages = Math.ceil((sortedListings?.length || 0) / ITEMS_PER_PAGE);
  const paginatedListings = sortedListings?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleOpenPopup = (id: string) => {
    router.push(`/Marketplace?listingId=${id}`);
  };

  const handleClosePopup = () => {
    router.push('/Marketplace');
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
    <div className="container mx-auto p-4 bg-background text-foreground text-white">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Marketplace</h1>
      </header>
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:block w-64 transition-all duration-300 ease-in-out">
          <div className="flex gap-4 flex-col w-full sm:w-auto">
            <Select value={selectedRarity} onValueChange={setSelectedRarity}>
              <SelectTrigger className="w-full sm:w-[180px] bg-[#1a1a25] text-white">
                <SelectValue placeholder="Select Rarity" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a25] text-white">
                <SelectItem value="all">All Rarities</SelectItem>
                {Object.entries(rarityColors).map(([rarity, color]) => (
                  <SelectItem key={rarity} value={rarity}>
                    <span style={{ color }}>
                      {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px] bg-[#1a1a25] text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a25] text-white text-center">
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="lowToHigh">Low to High</SelectItem>
                <SelectItem value="highToLow">High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </aside>
        <main className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <p className="text-sm text-muted-foreground">
              Showing {sortedListings?.length || 0} results
            </p>
          </div>
          <ScrollArea className="h-[calc(100vh-300px)] rounded-md border border-[#2a2a3b]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {paginatedListings ? (
                paginatedListings?.map((item) => (
                  <Card
                    key={item.id}
                    className="transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105 bg-[#14141b]"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{item.seedName}</CardTitle>
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
                          className="relative z-10 object-contain w-3/4 h-3/4 "
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-2xl font-bold">
                          ${item.price.toFixed(2)}
                        </p>
                        <Badge
                          className={`${rarityColors[item.seedRarity as keyof typeof rarityColors] || 'bg-gray-600'}`}
                        >
                          {item.seedRarity || 'Unknown'}
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full bg-[#1a1a25] text-white hover:bg-[#262630] transition duration-300"
                        onClick={() => handleOpenPopup(item.id.toString())}
                      >
                        <Info className="mr-2 h-4 w-4" />
                        Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="text-center text-xl">
                  <p>No listings found. Be the first to create one!</p>
                  <Button
                    className="w-full bg-[#1a1a25] text-white hover:bg-[#262630] transition duration-300"
                    onClick={() => router.push('/CreateListing')}
                  >
                    Create Listing
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
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
  );
}
