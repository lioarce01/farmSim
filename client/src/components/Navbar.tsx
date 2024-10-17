'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import useFetchUser from 'src/hooks/useFetchUser';
import { HiMenu, HiX } from 'react-icons/hi';
import { Button } from '../../components/ui/button';
import UserMenu from './UserMenu';
import LoginButton from './LoginButton';

const Navbar: React.FC = () => {
  const { isAuthenticated, user } = useAuth0();
  const { fetchedUser } = useFetchUser(user);
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  return (
    <nav className="fixed w-full top-0 z-20 bg-[#14141b] shadow-xl flex justify-between items-center p-4 h-16">
      {/* Brand - Logo to the left */}
      <div className="text-2xl font-bold text-white hover:text-gray-300 transition duration-300">
        <Link href="/">FarmSim</Link>
      </div>

      {/* Links - Moved to the right */}
      <ul className="hidden md:flex space-x-6 items-center ml-auto">
        <li>
          <Link
            href="/About"
            className="text-lg text-white hover:text-gray-300 transition duration-300"
          >
            About
          </Link>
        </li>
        {isAuthenticated && fetchedUser?.role === 'ADMIN' && (
          <li>
            <Link
              href="/Users"
              className="text-lg text-white hover:text-gray-300 transition duration-300"
            >
              Users
            </Link>
          </li>
        )}
        <li>
          <Button
            asChild
            className="bg-[#222231] hover:bg-[#29293b] text-white font-semibold transition duration-300"
          >
            <Link href="/Marketplace">Marketplace</Link>
          </Button>
        </li>
        <li>
          <Button
            asChild
            className="bg-[#222231] hover:bg-[#29293b] text-white font-semibold transition duration-300"
          >
            <Link href="/Store">Store</Link>
          </Button>
        </li>
      </ul>

      {/* User Menu or Login */}
      <div className="ml-4 flex items-center space-x-4">
        {isAuthenticated ? (
          <>
            {/* UserMenu only visible in large screens */}
            <div className="hidden md:block">
              <UserMenu />
            </div>
          </>
        ) : (
          <LoginButton />
        )}

        {/* Mobile Menu Button */}
        <button onClick={toggleMenu} className="md:hidden text-white">
          {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#2a2a3b] border-t border-[#38394a]">
          <ul className="flex flex-col items-center space-y-4 py-4">
            <li>
              <Link
                href="/About"
                className="text-lg text-white hover:text-gray-300 transition duration-300"
                onClick={toggleMenu}
              >
                About
              </Link>
            </li>
            {isAuthenticated && fetchedUser?.role === 'ADMIN' && (
              <li>
                <Link
                  href="/Users"
                  className="text-lg text-white hover:text-gray-300 transition duration-300"
                  onClick={toggleMenu}
                >
                  Users
                </Link>
              </li>
            )}
            <li>
              <Button
                asChild
                className="w-full bg-[#424256] hover:bg-[#38394a] border border-[#5e5e74] text-white font-semibold transition duration-300"
                onClick={toggleMenu}
              >
                <Link href="/Marketplace">Marketplace</Link>
              </Button>
            </li>
            <li>
              <Button
                asChild
                className="w-full bg-[#424256] hover:bg-[#38394a] border border-[#5e5e74] text-white font-semibold transition duration-300"
                onClick={toggleMenu}
              >
                <Link href="/Store">Store</Link>
              </Button>
            </li>

            {/* Mobile User Menu */}
            {isAuthenticated && (
              <li>
                <button
                  onClick={toggleUserMenu}
                  className="w-full bg-[#424256] hover:bg-[#38394a] text-white py-2 px-4 rounded-md transition duration-300"
                >
                  User Options
                </button>
                {isUserMenuOpen && (
                  <div className="mt-2 w-full bg-[#2a2a3b] border-t border-[#38394a] p-4 rounded-lg">
                    <UserMenu />
                  </div>
                )}
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
