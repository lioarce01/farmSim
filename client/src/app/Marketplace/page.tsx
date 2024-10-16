'use client';

import { useState } from 'react';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Checkbox } from '../../../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '../../../components/ui/sheet';
import { Star, Info, Menu } from 'lucide-react';
import { useGetMarketListingsQuery } from 'src/redux/api/market';
import bgPlant from '../assets/bgplant.jpg';

// Mock data
const items = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  price: Math.floor(Math.random() * 1000) + 1,
  category: ['Electronics', 'Clothing', 'Books', 'Home & Garden'][
    Math.floor(Math.random() * 4)
  ],
  rating: Math.floor(Math.random() * 5) + 1,
  description: `This is a detailed description of Product ${i + 1}. It includes all the necessary information about the product's features, specifications, and benefits.`,
}));

const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden'];

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const itemsPerPage = 12;
  const {
    data: marketListings,
    isLoading,
    isError,
  } = useGetMarketListingsQuery();

  console.log('market listings', marketListings);

  if (!marketListings || marketListings.length === 0)
    return <div>No market listings</div>;

  // const sortedItems = marketListings?.sort((a, b) => {
  //   if (sortBy === 'price') return a.price - b.price;
  //   if (sortBy === 'rarity') return b.seedRarity - a.seedRarity;
  //   return a?.seedName.localeCompare(b?.seedName || '');
  // });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  //   const currentItems = sortedItems.slice(indexOfFirstItem, indexOfLastItem);

  //   const pageCount = Math.ceil(sortedItems.length / itemsPerPage);

  //   const handleCategoryChange = (category: string) => {
  //     setSelectedCategories((prev) =>
  //       prev.includes(category)
  //         ? prev.filter((c) => c !== category)
  //         : [...prev, category],
  //     );
  //   };

  //   const Sidebar = () => (
  //     <div className="space-y-6">
  //       <Card className="bg-white">
  //         <CardHeader>
  //           <CardTitle>Search</CardTitle>
  //         </CardHeader>
  //         <CardContent>
  //           <Input
  //             placeholder="Search products..."
  //             value={searchTerm}
  //             onChange={(e) => setSearchTerm(e.target.value)}
  //           />
  //         </CardContent>
  //       </Card>
  //       <Card className="bg-white">
  //         <CardHeader>
  //           <CardTitle>Categories</CardTitle>
  //         </CardHeader>
  //         <CardContent className="space-y-2">
  //           {categories.map((category) => (
  //             <label key={category} className="flex items-center space-x-2">
  //               <Checkbox
  //                 checked={selectedCategories.includes(category)}
  //                 onCheckedChange={() => handleCategoryChange(category)}
  //               />
  //               <span>{category}</span>
  //             </label>
  //           ))}
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );

  return (
    <div className="container mx-auto p-4 bg-[#101016] text-[#0e0e0f]">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Marketplace</h1>
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="md:hidden bg-white">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[300px] sm:w-[400px] bg-[#0e0e0f]"
          >
            {/* <Sidebar /> */}
          </SheetContent>
        </Sheet>
      </header>
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="hidden md:block w-64 transition-all duration-300 ease-in-out">
          {/* <Sidebar /> */}
        </aside>
        <main className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground text-gray-500">
              Showing {indexOfFirstItem + 1}-
              {Math.min(indexOfLastItem, marketListings.length)} of{' '}
              {marketListings.length} results
            </p>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price">Price: Low to High</SelectItem>
                <SelectItem value="rating">Rating: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketListings?.map((item) => (
              <Card
                key={item.id}
                className="bg-white transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105"
              >
                <CardHeader>
                  <CardTitle>{item.seedName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-muted rounded-md mb-4 relative flex items-center justify-center border-2 border-[#262630]">
                    <img
                      src={bgPlant.src}
                      alt="bgPlant"
                      className="absolute inset-0 w-full h-full object-cover rounded-md blur-sm opacity-70"
                    />
                    <img
                      src={item?.seedImg || ''}
                      alt={item?.seedName || ''}
                      className="relative z-10 w-45 h-45 object-contain"
                    />
                  </div>

                  <p className="text-2xl font-bold">${item.price}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.seedRarity}
                  </p>
                  {/* <div className="flex items-center mt-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${index < item?.seedRarity ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill={index < item.rating ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div> */}
                </CardContent>
                <CardFooter>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-[#0e0e0f] text-[#e4e4e4]">
                        <Info className="mr-2 h-4 w-4" />
                        Info
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-white">
                      <DialogHeader>
                        <DialogTitle>{item.seedName}</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <span className="font-bold">Price:</span>
                          <span className="col-span-3">${item.price}</span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <span className="font-bold">Category:</span>
                          <span className="col-span-3">{item.seedRarity}</span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4"></div>
                        <div className="grid grid-cols-4 items-start gap-4">
                          <span className="font-bold">Description:</span>
                          <p className="col-span-3">{item.seedDescription}</p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          className="bg-[#0e0e0f] text-white"
                          onClick={() =>
                            alert(`You've purchased ${item.seedName}!`)
                          }
                        >
                          Buy Now
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="flex justify-center mt-8 space-x-2">
            <Button
              className="bg-white"
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {/* {Array.from({ length: pageCount }, (_, i) => (
              <Button
                key={i + 1}
                className="bg-white"
                variant={currentPage === i + 1 ? 'default' : 'outline'}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              className="bg-white"
              variant="outline"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, pageCount))
              }
              disabled={currentPage === pageCount}
            >
              Next
            </Button> */}
          </div>
        </main>
      </div>
    </div>
  );
}
