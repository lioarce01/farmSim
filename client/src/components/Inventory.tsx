'use client'

import React from 'react';
import { FaTimes } from 'react-icons/fa';
import useFetchUser from 'src/hooks/useFetchUser';

interface Seed {
  id: string;
  name: string;
}

interface Water {
  id: string;
  name: string;
}

interface InventoryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSeedSelect: (seed: Seed) => void; // Función para seleccionar una semilla
  onWaterSelect: (water: Water) => void; // Función para seleccionar agua
}

const InventoryPopup: React.FC<InventoryPopupProps> = ({
  isOpen,
  onClose,
  onSeedSelect,
  onWaterSelect,
}) => {
  const { user: fetchedUser, error, isLoading } = useFetchUser();

  if (isLoading) {
    return <span className="text-[#A8D5BA] font-semibold">Loading inventory...</span>;
  }
  
  if (error) {
    const e = error as Error
    console.error('Error fetching user:', error);
    return <div className="text-red-500">{`Error: ${e.message || 'Unknown error'}`}</div>;
  }

  const { seeds = [], waters = [] } = fetchedUser?.inventory || {};

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

        <h3 className="text-md font-semibold text-[#172c1f] mb-2">Seeds</h3>
        <ul className="mb-4">
          {seeds.length > 0 ? (
            seeds.map((seed: Seed, index: number) => (
              <li key={index} className="flex justify-between text-[#172c1f] mb-2">
                <span>{seed.name}</span>
                <button
                  className="bg-[#FFB385] text-[#172c1f] font-semibold px-3 py-1 rounded-lg hover:bg-[#FFC1A1] transition duration-300"
                  onClick={() => onSeedSelect(seed)}
                >
                  Plant
                </button>
              </li>
            ))
          ) : (
            <p className="text-[#172c1f] mb-4">No seeds available.</p>
          )}
        </ul>

        <h3 className="text-md font-semibold text-[#172c1f] mb-2">Waters</h3>
        <ul className="mb-4">
          {waters.length > 0 ? (
            waters.map((water: Water, index: number) => (
              <li key={index} className="flex justify-between text-[#172c1f] mb-2">
                <span>{water.name}</span>
                <button
                  className="bg-[#FFB385] text-[#172c1f] font-semibold px-4 py-1 rounded-lg hover:bg-[#FFC1A1] transition duration-300"
                  onClick={() => onWaterSelect(water)}
                >
                  Use
                </button>
              </li>
            ))
          ) : (
            <p className="text-[#172c1f] mb-4">No waters available.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default InventoryPopup;
