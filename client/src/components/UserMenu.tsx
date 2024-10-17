'use client';

import { useState } from 'react';
import { FaCaretDown, FaPlus, FaCoins } from 'react-icons/fa';
import { LogOut, User, Warehouse } from 'lucide-react';
import useFetchUser from '../hooks/useFetchUser';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import Link from 'next/link';
import LoadingSpinner from './LoadingSpinner';
import LogoutButton from './LogoutButton';

const UserMenu: React.FC = () => {
  const { user } = useAuth0();
  const { fetchedUser, isLoading: isUserLoading } = useFetchUser(user);
  const [isOpen, setIsOpen] = useState(false);

  if (isUserLoading) {
    return (
      <div className="flex items-center p-2 rounded-lg shadow-md h-12 bg-[#2a2a3b]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative flex items-center p-2 rounded-lg shadow-lg h-12 cursor-pointer bg-[#1e1e29] hover:bg-[#202030] transition duration-300">
          <FaCoins className="text-[#FFD700] mr-2" size={20} />
          <span className="flex items-center mr-2 text-white font-extrabold text-sm">
            <span className="bg-[#252538] text-white font-semibold px-2 py-1 rounded-xl shadow-md">
              $ {fetchedUser?.balanceToken}
            </span>
          </span>
          <User className="text-[#4042b3] mr-2" size={25} />
          <span className="mr-2 text-white font-extrabold text-sm">
            {fetchedUser?.nickname}{' '}
            <FaCaretDown className="inline-block ml-1" />
          </span>
        </div>
      </DropdownMenuTrigger>

      {/* Dropdown content that is also responsive */}
      <DropdownMenuContent
        align="end"
        className="w-full bg-[#1c1c29] rounded-lg shadow-lg border border-[#1f1f29] flex flex-col justify-start"
      >
        <DropdownMenuItem asChild>
          <Link
            href="/Farm"
            className="flex px-4 py-4 text-sm justify-center text-white hover:bg-[#1d1d2b] rounded-lg transition duration-300"
          >
            <Warehouse className="mr-2" size={16} />
            My Farm
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <div className="flex text-sm justify-center text-white hover:bg-[#1d1d2b] rounded-lg transition duration-300 cursor-pointer">
            <LogoutButton />
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
