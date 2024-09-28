'use client';

import { useSelector } from 'react-redux';
import { RootState } from 'src/redux/store/store'; // Asegúrate de que esta importación es correcta
import useFetchUser from '../hooks/useFetchUser'; // Importa el hook
import LogoutButton from './LogoutButton';
import { FaUserCircle, FaCoins, FaCaretDown } from 'react-icons/fa';
import { useState } from 'react';
import InventoryPopup from './Inventory';

const UserMenu: React.FC = () => {
  const { user: fetchedUser, error, isLoading } = useFetchUser();
  const user = useSelector((state: RootState) => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  // Manejo de estados de carga y error
  if (isLoading) return <div className="text-[#A8D5BA]">Loading user info...</div>;
  if (error) return <div className="text-red-500">{`Error: ${error}`}</div>;

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

  return (
    <div className="relative flex items-center bg-[#FDE8C9] p-2 rounded-lg shadow-md h-12">
      {fetchedUser && (
        <>
          <FaUserCircle className="text-[#A8D5BA] mr-2" size={20} />
          <span className="mr-2 text-[#172c1f] font-semibold text-sm cursor-pointer" onClick={toggleMenu}>
            {fetchedUser.nickname || user.nickname} <FaCaretDown className="inline-block ml-1" />
          </span>
          <FaCoins className="text-[#FFB385] mr-2" size={20} />
          <span className="mr-4 text-[#172c1f] font-medium text-sm">
            Balance Tokens: <span className="text-[#FFB385]">{fetchedUser.balanceToken || 0}</span>
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
                <button 
                  className="px-4 py-2 w-full text-left text-[#333] hover:bg-[#FFC1A1] transition duration-300 font-semibold"
                >
                  My Farm
                </button>
              </div>
              <div className="p-2 w-full">
                <LogoutButton />
              </div>
            </div>
          )}
          <InventoryPopup isOpen={isInventoryOpen} onClose={closeInventory}/>
        </>
      )}
    </div>
  );
};

export default UserMenu;
