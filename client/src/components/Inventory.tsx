import React from 'react';
import { FaTimes } from 'react-icons/fa';
import useFetchUser from 'src/hooks/useFetchUser';

interface InventoryPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const InventoryPopup: React.FC<InventoryPopupProps> = ({ isOpen, onClose }) => {
    const { user: fetchedUser, error, isLoading } = useFetchUser();
    
    if (!fetchedUser || !fetchedUser.inventory) {
        return <div className="text-red-500">Inventory not available.</div>;
    }

    const { seeds, waters } = fetchedUser.inventory;
    
    if (isLoading) return <div className="text-[#A8D5BA]">Loading inventory...</div>
    if (error) return <div className="text-red-500">{`Error: ${error}`}</div>;
  

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-[#FFF5D1] p-6 rounded-lg shadow-lg w-96 relative">
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-[#FFB385] hover:text-red-500 transition duration-300"
            >
              <FaTimes size={20} />
            </button>
            <h2 className="text-lg font-semibold mb-4 text-[#172c1f]">Inventory</h2>
    
            {/* Mostrar las semillas (seeds) */}
            <h3 className="text-md font-semibold text-[#172c1f]">Seeds</h3>
            {seeds.length > 0 ? (
              <ul className="mb-4">
                {seeds.map((seed, index) => (
                  <li key={index} className="text-[#172c1f] mb-2">
                    {seed.name} - Quantity: {seed.quantity}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[#172c1f] mb-4">No seeds available.</p>
            )}
    
            {/* Mostrar las aguas (waters) */}
            <h3 className="text-md font-semibold text-[#172c1f]">Waters</h3>
            {waters.length > 0 ? (
              <ul>
                {waters.map((water, index) => (
                  <li key={index} className="text-[#172c1f] mb-2">
                    {water.name} - Quantity: {water.quantity}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[#172c1f]">No waters available.</p>
            )}
          </div>
        </div>
      );
};

export default InventoryPopup;