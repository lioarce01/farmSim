'use client';

import Link from 'next/link';
import UserMenu from './UserMenu';
import LoginButton from './login';
import { useAuth0 } from '@auth0/auth0-react';

const Navbar: React.FC = () => {
  const { isAuthenticated } = useAuth0();

  return (
    <nav className="bg-[#BCE6EB] p-4 shadow-md fixed w-full top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo or brand name */}
        <div className="text-2xl font-bold hover:text-[#FFC1A1] transition duration-300">
          <Link href="/">FarmSim</Link>
        </div>

        {/* Links */}
        <ul className="flex space-x-6 items-center">
          <li>
            <Link href="/Home" className="hover:text-[#FFD3B6] transition duration-300">
              Home
            </Link>
          </li>
          <li>
            <Link href="/Users" className="hover:text-[#FFD3B6] transition duration-300">
              Users
            </Link>
          </li>
          <li>
            <Link href="/Store" className="hover:text-[#FFD3B6] transition duration-300">
              Store
            </Link>
          </li>
          {/* Authentication: Show either UserMenu or LoginButton */}
          <li>
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <LoginButton />
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;