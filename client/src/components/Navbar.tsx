'use client'

import Link from 'next/link';
import { useState } from 'react';
import UserMenu from './UserMenu';
import LoginButton from './LoginButton';
import { useAuth0 } from '@auth0/auth0-react';
import useFetchUser from 'src/hooks/useFetchUser';
import { HiMenu, HiX } from 'react-icons/hi'; 

const Navbar: React.FC = () => {
  const { isAuthenticated } = useAuth0();
  const { user } = useFetchUser();
  const [isOpen, setIsOpen] = useState(false); 

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-[#A8D5BA] p-4 shadow-lg fixed w-full top-0 z-10 flex items-center justify-between transition duration-300">

      <div className="text-3xl font-bold text-[#333] hover:text-[#FFB385] transition duration-300">
        <Link href="/">FarmSim</Link>
      </div>

      <ul className="hidden md:flex space-x-8 ml-auto items-center">
        <li>
          <Link href="/Home" className="text-lg text-[#333] hover:text-[#FFB385] transition duration-300">
            Home
          </Link>
        </li>
        {isAuthenticated && user?.role === 'ADMIN' && (
          <li>
            <Link href="/Users" className="text-lg text-[#333] hover:text-[#FFB385] transition duration-300">
              Users
            </Link>
          </li>
        )}
        <li>
          <Link href="/Store" className="text-lg text-[#333] hover:text-[#FFB385] transition duration-300">
            Store
          </Link>
        </li>
        <li>{isAuthenticated ? <UserMenu /> : <LoginButton />}</li>
      </ul>

      <div className="md:hidden flex items-center">
        <button onClick={toggleMenu} className="text-3xl text-[#333] focus:outline-none">
          {isOpen ? <HiX /> : <HiMenu />}
        </button>
      </div>

      {isOpen && (
        <ul className="absolute top-16 left-0 w-full bg-[#A8D5BA] flex flex-col items-center space-y-4 py-4 shadow-lg">
          <li>
            <Link href="/Home" className="text-lg text-[#333] hover:text-[#FFB385] transition duration-300" onClick={toggleMenu}>
              Home
            </Link>
          </li>
          {isAuthenticated && user?.role === 'ADMIN' && (
            <li>
              <Link href="/Users" className="text-lg text-[#333] hover:text-[#FFB385] transition duration-300" onClick={toggleMenu}>
                Users
              </Link>
            </li>
          )}
          <li>
            <Link href="/Store" className="text-lg text-[#333] hover:text-[#FFB385] transition duration-300" onClick={toggleMenu}>
              Store
            </Link>
          </li>
          <li>{isAuthenticated ? <UserMenu /> : <LoginButton />}</li>
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
