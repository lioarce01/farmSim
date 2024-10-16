'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import useFetchUser from 'src/hooks/useFetchUser';
import { HiMenu, HiX } from 'react-icons/hi';
import nav from '../app/assets/nav.jpg';
import UserMenu from './UserMenu';
import LoginButton from './LoginButton';
import { useRouter } from 'next/navigation';

const Navbar: React.FC = () => {
  const { isAuthenticated, user } = useAuth0();
  const { fetchedUser } = useFetchUser(user);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleCLick = () => {
    router.push('/Store');
  };

  return (
    <nav className="fixed w-full top-0 z-20 flex items-center justify-center">
      <div
        className="shadow-lg mt-4 rounded-lg min-w-[80%] flex items-center flex-row max-w-7xl p-4 bg-[#522a0f] bg-cover bg-center h-18 relative"
        style={{
          backgroundImage: `url('${nav.src}')`,
          backgroundRepeat: 'repeat',
          backgroundSize: 'cover',
        }}
      >
        <div
          className="absolute inset-0 z-0 shadow-md shadow-black border-b-4 border-r-4 border-[#4b2312] transition duration-300 rounded-lg min-w-[80%] opacity-[70%]"
          style={{
            backgroundImage: `url('${nav.src}')`,
            backgroundRepeat: 'repeat',
            backgroundSize: 'cover',
          }}
        />

        <div className="relative z-10 text-4xl font-extrabold text-[#ffb98e] hover:text-[#fae3d8] transition duration-300">
          <Link href="/">FarmSim</Link>
        </div>

        <ul className="hidden md:flex space-x-12 ml-auto items-center relative z-10">
          <li>
            <Link
              href="/About"
              className="text-lg text-[#f8d7c6] font-extrabold hover:text-[#faebe3] transition duration-300"
            >
              About Us
            </Link>
          </li>
          {isAuthenticated && fetchedUser?.role === 'ADMIN' && (
            <li>
              <Link
                href="/Users"
                className="text-lg text-[#f8d7c6] font-extrabold hover:text-[#faebe3] transition duration-300"
              >
                Users
              </Link>
            </li>
          )}
          <li>
            <Link
              href="/Marketplace"
              className="px-6 py-3 bg-[#8d3c19] border-r-4 border-b-4 border-[#632911] text-[#FDE8C9] font-extrabold rounded-lg shadow-lg transition mx-4 duration-300 transform hover:scale-105 hover:bg-[#7c3617] hover:text-[#ffb98e]"
            >
              Marketplace
            </Link>
          </li>
          <li>
            <Link
              href="/Store"
              className="px-6 py-3 bg-[#8d3c19] border-r-4 border-b-4 border-[#632911] text-[#FDE8C9] font-extrabold rounded-lg shadow-lg transition mx-4 duration-300 transform hover:scale-105 hover:bg-[#7c3617] hover:text-[#ffb98e]"
            >
              Store
            </Link>
          </li>
        </ul>
        {isAuthenticated ? <UserMenu /> : <LoginButton />}

        <button
          onClick={toggleMenu}
          className="md:hidden text-3xl text-[#FFB385] focus:outline-none relative z-10"
        >
          {isOpen ? <HiX /> : <HiMenu />}
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-16 left-0 w-full mx-4 mt-6 bg-[#FFF5D1] flex flex-col items-center space-y-4 py-4 shadow-lg rounded-lg">
          <ul className="w-full flex flex-col items-center">
            <li>
              <Link
                href="/About"
                className="text-lg text-[#5f380c] hover:text-[#FFC1A1] transition duration-300 font-medium"
                onClick={toggleMenu}
              >
                About Us
              </Link>
            </li>
            {isAuthenticated && fetchedUser?.role === 'ADMIN' && (
              <li>
                <Link
                  href="/Users"
                  className="text-lg text-[#333] hover:text-[#FFC1A1] transition duration-300 font-medium"
                  onClick={toggleMenu}
                >
                  Users
                </Link>
              </li>
            )}
            <li>
              <Link
                href="/Marketplace"
                className="bg-[#B5EAD7] border-2 border-[#4b2312] text-[#333] font-extrabold px-4 py-3 rounded-lg hover:bg-[#4b2312] hover:text-white transition duration-300"
                onClick={toggleMenu}
              >
                Marketplace
              </Link>
            </li>
            <li>
              <Link
                href="/Store"
                className="bg-[#B5EAD7] border-2 border-[#4b2312] text-[#333] font-extrabold px-4 py-3 rounded-lg hover:bg-[#4b2312] hover:text-white transition duration-300"
                onClick={toggleMenu}
              >
                Store
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
