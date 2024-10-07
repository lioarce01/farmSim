'use client';

import useFetchUser from '../hooks/useFetchUser';
import LogoutButton from './LogoutButton';
import { FaUserCircle, FaCoins, FaCaretDown, FaPlus } from 'react-icons/fa';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth0 } from '@auth0/auth0-react';
import LoadingSpinner from './LoadingSpinner';

const UserMenu: React.FC = () => {
  const { user } = useAuth0();
  const {
    fetchedUser,
    fetchError,
    isLoading: isUserLoading,
  } = useFetchUser(user);
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center bg-[#FDE8C9] p-2 rounded-lg shadow-md h-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="relative flex items-center bg-[#FFF5D1] p-2 rounded-lg shadow-lg h-12 transition duration-300 hover:shadow-xl">
      <FaUserCircle className="text-[#A8D5BA] mr-2" size={25} />
      <span
        className="mr-2 text-[#572c11] font-extrabold text-sm cursor-pointer hover:text-[#FFB385] transition duration-300"
        onClick={toggleMenu}
      >
        {fetchedUser?.nickname} <FaCaretDown className="inline-block ml-1" />
      </span>
      <FaCoins className="text-[#FFB385] mr-2" size={20} />
      <span className="flex items-center mr-2 text-[#572c11] font-extrabold text-sm">
        <span className="bg-[#FFB385] text-[#572c11] hover:scale-105 transition duration-300 font-semibold px-2 py-1 rounded-xl shadow-md">
          T$ {fetchedUser?.balanceToken}
        </span>
      </span>
      {/* Botón de agregar monedas */}
      <button className="flex items-center justify-center hover:scale-105 bg-[#FFB385] text-[#572c11] hover:bg-[#e69a6b] p-2 rounded-full shadow-md transition duration-300">
        <FaPlus className="text-[#572c11]" size={12} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[50px] w-48 bg-[#FFF5D1] rounded-lg z-10 shadow-lg border border-[#FFC1A1] transition duration-300 hover:border-[#FFB385]">
          <div className="p-2">
            <Link
              href="/Farm"
              className="block px-4 py-2 text-left text-[#572c11] font-extrabold hover:bg-[#FFB385] hover:text-[#FFF5D1] rounded-lg transition duration-300"
            >
              My Farm
            </Link>
          </div>
          <div className="p-2">
            <LogoutButton />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
