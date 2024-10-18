'use client';

import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import useFetchUser from 'src/hooks/useFetchUser';
import { Rarity, Seed, Water } from '../types/index';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Badge } from '../../components/ui/badge';

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

  const { seeds = [], waters = [] } = fetchedUser?.inventory || {};

  const rarityColors: Record<Rarity, string> = {
    [Rarity.LEGENDARY]: 'bg-yellow-500',
    [Rarity.EPIC]: 'bg-purple-600',
    [Rarity.RARE]: 'bg-blue-600',
    [Rarity.UNCOMMON]: 'bg-gray-500',
    [Rarity.COMMON]: 'bg-gray-700',
    [Rarity.ALL]: 'bg-gradient-to-r from-yellow-500 via-purple-600 to-blue-600',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#1a1a25] text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Inventory</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="text-[#A8D5BA] font-semibold animate-pulse">
            Loading inventory...
          </div>
        ) : fetchError ? (
          <div className="text-red-500">
            Error: {(fetchError as Error).message || 'Unknown error'}
          </div>
        ) : (
          <ScrollArea className="h-[60vh] pr-4">
            {pathname === '/Farm' && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2 text-lg">Seeds:</h3>
                {seeds.length > 0 ? (
                  <ul className="space-y-2">
                    {seeds.map((seed: Seed) => (
                      <li
                        key={seed.id}
                        className="flex justify-between items-center p-3 rounded-lg bg-[#222231] transition-all duration-300 hover:bg-[#29293b]"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{seed.name}</span>
                          <Badge
                            className={`${rarityColors[seed.rarity]} text-xs mt-1`}
                          >
                            {seed.rarity}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          className="bg-[#222231] hover:bg-[#29293b] text-white transition duration-300"
                          onClick={() => {
                            onSeedSelect(seed);
                            onClose();
                          }}
                        >
                          Plant
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-red-500 font-semibold">
                    No seeds available.
                  </p>
                )}
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-2 text-lg">Waters:</h3>
              {waters.length > 0 ? (
                <ul className="space-y-2">
                  {waters.map((water: Water) => (
                    <li
                      key={water.id}
                      className="flex justify-between items-center p-3 rounded-lg bg-[#222231] transition-all duration-300 hover:bg-[#29293b]"
                    >
                      <span className="font-medium">{water.name}</span>
                      <Button
                        variant="outline"
                        className="bg-[#222231] hover:bg-[#29293b] text-white transition duration-300"
                        onClick={() => {
                          onWaterSelect(water);
                          onClose();
                        }}
                      >
                        Use
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-red-500 font-semibold">
                  No water available.
                </p>
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InventoryPopup;
