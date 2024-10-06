'use client';

import useFetchUser from '../hooks/useFetchUser';
import LogoutButton from './LogoutButton';
import { FaUserCircle, FaCoins, FaCaretDown } from 'react-icons/fa';
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
    <div className="relative flex items-center bg-[#FDE8C9] p-2 rounded-lg shadow-md h-12">
      <FaUserCircle className="text-[#A8D5BA] mr-2" size={25} />
      <span
        className="mr-2 text-[#172c1f] font-semibold text-sm cursor-pointer"
        onClick={toggleMenu}
      >
        {fetchedUser?.nickname} <FaCaretDown className="inline-block ml-1" />
      </span>
      <FaCoins className="text-[#FFB385] mr-2" size={20} />
      <span className="flex items-center mr-4 text-[#172c1f] font-medium text-sm">
        <span className="bg-[#FFB385] text-[#172c1f] font-semibold px-2 py-1 rounded-xl shadow-md">
          T$ {fetchedUser?.balanceToken}
        </span>
      </span>

      {isOpen && (
        <div className="absolute right-0 top-[50px] w-48 bg-[#FDE8C9] rounded-b-lg z-10 shadow-lg border border-[#FFC1A1]">
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
    </div>
  );
};

export default UserMenu;
