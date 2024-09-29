'use client'

import React, { useState } from 'react';
import InventoryPopup from '../../components/Inventory'; // Importa el componente de inventario
import Navbar from '../../components/Navbar'; // Importa el componente de Navbar

const Farm = () => {
  const [slots, setSlots] = useState(Array(8).fill(null)); // 8 slots vacíos
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null); // Slot seleccionado para insertar semilla

  const openInventory = (slotIndex: number) => {
    setSelectedSlot(slotIndex);
    setIsInventoryOpen(true);
  };

  const closeInventory = () => {
    setIsInventoryOpen(false);
    setSelectedSlot(null); // Reinicia la selección de slot
  };

  const plantSeed = (seed: any) => {
    if (selectedSlot !== null) {
      const newSlots = [...slots];
      newSlots[selectedSlot] = seed;
      setSlots(newSlots);
      closeInventory();
    }
  };

  return (
    <div className="bg-[#FFF5D1] min-h-screen">
      <Navbar />

      <div className="p-8 pt-24">
        <h1 className="text-[#172c1f] text-3xl font-bold mb-6">My Farm</h1>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {slots.map((slot, index) => (
            <div
              key={index}
              className="border-4 border-[#FFB385] bg-[#FDE8C9] h-24 flex items-center justify-center rounded-lg shadow-md"
            >
              {slot ? (
                <span className="text-[#172c1f] font-semibold">{slot.name}</span>
              ) : (
                <button
                  className="bg-[#FFB385] text-[#172c1f] font-semibold px-4 py-1 rounded-lg hover:bg-[#FFC1A1] transition duration-300"
                  onClick={() => openInventory(index)}
                >
                  Add seed
                </button>
              )}
            </div>
          ))}
        </div>

        <InventoryPopup
          isOpen={isInventoryOpen}
          onClose={closeInventory}
          onSeedSelect={plantSeed}
        />
      </div>
    </div>
  );
};

export default Farm;
