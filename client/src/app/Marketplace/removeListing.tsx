import { useAuth0 } from '@auth0/auth0-react';
import { Button } from 'components/ui/button';
import { useRouter } from 'next/navigation';
import React from 'react';
import useFetchUser from 'src/hooks/useFetchUser';
import {
  useDeleteMarketListingMutation,
  useGetMarketListingByIdQuery,
} from 'src/redux/api/market';

interface RemoveListingProps {
  marketListingId: string;
  sellerId: string;
  refetchMarketListings: () => void;
}

const removeListing: React.FC<RemoveListingProps> = ({
  marketListingId,
  sellerId,
  refetchMarketListings,
}) => {
  const { user } = useAuth0();
  const { fetchedUser } = useFetchUser(user);
  const {
    data: listing,
    isLoading,
    isError,
    error,
  } = useGetMarketListingByIdQuery(marketListingId);
  const [
    deleteMarketListing,
    { isLoading: isDeleting, isError: isDeleteError, error: deleteError },
  ] = useDeleteMarketListingMutation();

  const router = useRouter();

  const handleRemoveListing = async () => {
    try {
      await deleteMarketListing(marketListingId);
      router.push('/Marketplace');
    } catch (err) {
      console.error('Error al eliminar:', err);
    }
  };
  return (
    <div>
      {fetchedUser?.id === sellerId && (
        <Button
          className="bg-[#222231] hover:bg-[#29293b] text-white transition duration-300 ease-in-out"
          onClick={handleRemoveListing}
          disabled={isLoading}
        >
          {isDeleting ? 'Deleting...' : 'Delete Listing'}
        </Button>
      )}
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

export default removeListing;
