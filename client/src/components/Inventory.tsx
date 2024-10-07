'use client';

import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import useFetchUser from 'src/hooks/useFetchUser';
import { Rarity, Seed, Water } from '../types/index';
import { useAuth0 } from '@auth0/auth0-react';

interface InventoryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSeedSelect: (seed: Seed) => void;
  onWaterSelect: (water: Water) => void;
  selectedSlot: number | null;
  action: 'plant' | 'water' | null;
}

const InventoryPopup: React.FC<InventoryPopupProps> = ({
  isOpen,
  onClose,
  onSeedSelect,
  onWaterSelect,
  selectedSlot,
  action,
}) => {
  const { user } = useAuth0();
  const { fetchedUser, fetchError, isLoading } = useFetchUser(user);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isLoading) {
    return (
      <span className="text-[#A8D5BA] font-semibold">Loading inventory...</span>
    );
  }

  if (fetchError) {
    const e = fetchError as Error;
    console.error('Error fetching user:', e.message);
    return (
      <div className="text-red-500">Error: {e.message || 'Unknown error'}</div>
    );
  }

  const { seeds = [], waters = [] } = fetchedUser?.inventory || {};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-[#FFF5D1] p-6 rounded-lg shadow-lg w-96 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-[#FFB385] hover:text-[#FFC1A1] transition duration-300"
        >
          <FaTimes size={24} />
        </button>

        <h2 className="text-center text-xl font-bold mb-4">Inventory</h2>

        {pathname === '/Farm' && (
          <>
            <h3 className="font-semibold mb-2">Seeds:</h3>
            {seeds.length > 0 ? (
              <ul className="mb-4 space-y-2">
                {seeds.map((seed: Seed) => (
                  <li
                    key={seed.id}
                    className="flex justify-between items-center p-2 border border-[#FFC1A1] rounded-lg bg-[#FFEDDA]"
                  >
                    <span className="text-[#398b5a] font-medium">
                      {seed.name}
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        seed.rarity === Rarity.LEGENDARY
                          ? 'text-yellow-500'
                          : seed.rarity === Rarity.EPIC
                            ? 'text-purple-600'
                            : seed.rarity === Rarity.RARE
                              ? 'text-blue-600'
                              : seed.rarity === Rarity.UNCOMMON
                                ? 'text-gray-500'
                                : 'text-gray-700'
                      }`}
                    >
                      {seed.rarity}
                    </span>
                    <button
                      className="bg-[#398b5a] text-white px-2 py-1 rounded hover:bg-[#276844] transition duration-300"
                      onClick={() => {
                        onSeedSelect(seed);
                        onClose();
                      }}
                    >
                      Plant
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-red-500 font-semibold">No seeds available.</p>
            )}
          </>
        )}

        <h3 className="font-semibold mb-2">Waters:</h3>
        {waters.length > 0 ? (
          <ul>
            {waters.map((water: Water) => (
              <li
                key={water.id}
                className="flex justify-between items-center mb-2 p-2 border border-[#FFC1A1] rounded-lg bg-[#FFEDDA]"
              >
                <span className="text-[#398b5a] font-medium">{water.name}</span>
                <button
                  className="bg-[#398b5a] text-white px-2 py-1 rounded hover:bg-[#276844] transition duration-300"
                  onClick={() => {
                    onWaterSelect(water);
                    onClose();
                  }}
                >
                  Use
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-red-500 font-semibold">No water available.</p>
        )}
      </div>
    </div>
  );
};

export default InventoryPopup;
