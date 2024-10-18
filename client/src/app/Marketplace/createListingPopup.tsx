import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';
import { useCreateMarketListingMutation } from '../../redux/api/market';
import useFetchUser from 'src/hooks/useFetchUser';

interface CreateListingPopupProps {
  refetchMarketListings: () => void;
}

export default function CreateListingPopup({
  refetchMarketListings,
}: CreateListingPopupProps) {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState('');
  const [selectedSeedId, setSelectedSeedId] = useState('');
  const { user } = useAuth0();
  const [createMarketListing, { isLoading, isError, error }] =
    useCreateMarketListingMutation();
  const { fetchedUser, fetchUserData } = useFetchUser(user);
  const inventory = fetchedUser?.inventory;
  console.log('user inventory', inventory);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.sub || !selectedSeedId || !price) return;

    try {
      await createMarketListing({
        price: parseFloat(price),
        sellerId: fetchedUser?.id,
        seedId: selectedSeedId,
      }).unwrap();
      refetchMarketListings();
      setOpen(false);
      setPrice('');
      setSelectedSeedId('');
    } catch (err) {
      console.error('Error creating market listing:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#222231] hover:bg-[#29293b] text-white transition duration-300 ease-in-out">
          Create Listing
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#1a1a25] text-white">
        <DialogHeader>
          <DialogTitle>Create New Listing</DialogTitle>
          <DialogDescription>
            Create a new listing for your seed in the marketplace.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="seed" className="text-right">
              Seed
            </Label>
            <Select onValueChange={setSelectedSeedId} value={selectedSeedId}>
              <SelectTrigger className="col-span-3 bg-[#232331]">
                <SelectValue placeholder="Select a seed" />
              </SelectTrigger>
              <SelectContent className="bg-[#232331] text-white border border-[#1f1f2c]">
                {inventory?.seeds?.length ? (
                  inventory?.seeds?.map((seed) => (
                    <SelectItem key={seed.id} value={seed.id}>
                      {seed.name}
                    </SelectItem>
                  ))
                ) : (
                  <p className="text-center">No seeds in inventory</p>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price
            </Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="col-span-3 bg-[#232331] border-none"
              placeholder="Enter price"
            />
          </div>
          <div className="flex justify-end mt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#222231] hover:bg-[#2c2c3f] transition duration-300"
            >
              {isLoading ? 'Creating...' : 'Create Listing'}
            </Button>
          </div>
        </form>
        {isError && (
          <p className="text-red-500">
            Error:{' '}
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
