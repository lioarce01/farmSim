'use client';

import { useSelector } from 'react-redux';
import { RootState } from 'src/redux/store/store';
import useFetchUser from '../hooks/useFetchUser';
import LogoutButton from './LogoutButton';
import { FaUserCircle, FaCoins, FaCaretDown } from 'react-icons/fa';
import { useState } from 'react';
import InventoryPopup from './Inventory';
import Link from 'next/link';

const UserMenu: React.FC = () => {
  const { user: fetchedUser, error, isLoading } = useFetchUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const openInventory = () => {
    setIsInventoryOpen(true);
    setIsOpen(false);
  };

  const closeInventory = () => {
    setIsInventoryOpen(false);
  };


  let errorMessage = 'Error desconocido';
  if (error) {
    if ('status' in error) {
      // Comprobar si el error tiene la propiedad 'status'
      if (error.status === 409) {
        errorMessage = 'El usuario ya existe.';
      } else {
        errorMessage = 'Error al cargar el usuario.';
      }
    } else if (error instanceof Error) {
      // Si el error es una instancia de Error
      errorMessage = error.message;
    }
  }

  if (error) {
    return (
      <div className="text-red-500 p-2 border border-red-600 bg-red-100 rounded-md">
        <strong>Error:</strong> {errorMessage}
      </div>
    );
  }

  return (
    <div className="relative flex items-center bg-[#FDE8C9] p-2 rounded-lg shadow-md h-12">
      <FaUserCircle className="text-[#A8D5BA] mr-2" size={25} />
      <span className="mr-2 text-[#172c1f] font-semibold text-sm cursor-pointer" onClick={toggleMenu}>
        {fetchedUser?.nickname} <FaCaretDown className="inline-block ml-1" />
      </span>
      <FaCoins className="text-[#FFB385] mr-2" size={20} />
      <span className="flex items-center mr-4 text-[#172c1f] font-medium text-sm">
        <span className="mr-1">Balance Tokens:</span>
        <span className="bg-[#FFB385] text-[#172c1f] font-semibold px-2 py-1 rounded-full shadow-md">
          {fetchedUser?.balanceToken}
        </span>
      </span>

      {/* Menú desplegable */}
      {isOpen && (
        <div className="absolute right-0 top-[50px] w-48 bg-[#FDE8C9] rounded-b-lg z-10 shadow-lg border border-[#FFC1A1]">
          <div className="p-2 w-full">
            <button 
              className="px-4 py-2 w-full text-left text-[#333] hover:bg-[#FFC1A1] transition duration-300 font-semibold"
              onClick={openInventory}
            >
              My Inventory
            </button>
          </div>

          <div className="p-2 w-full">
            <Link
              href="/Farm"
              className="px-4 py-2 w-full text-left text-[#333] hover:bg-[#FFC1A1] transition duration-300 font-semibold block"
              >
              My Farm
            </Link>
          </div>
          <div className="p-2 w-full">
            <LogoutButton />
          </div>
        </div>
      )}
      <InventoryPopup isOpen={isInventoryOpen} onClose={closeInventory} />
    </div>
  );
};

export default UserMenu;
