'use client'

import Link from 'next/link';
import UserMenu from './UserMenu';
import LoginButton from './login';
import { useAuth0 } from '@auth0/auth0-react';

const Navbar: React.FC = () => {
  const { isAuthenticated } = useAuth0();

  return (
    <nav className="bg-[#A8D5BA] p-4 shadow-lg fixed w-full top-0 z-10 flex items-center transition duration-300">
      <div className="text-3xl font-bold text-[#333] hover:text-[#FFB385] transition duration-300"> {/* Cambiado el hover */}
        <Link href="/">FarmSim</Link>
      </div>
      <ul className="flex space-x-8 ml-auto items-center">
        <li>
          <Link href="/Home" className="text-lg text-[#333] hover:text-[#FFB385] transition duration-300"> {/* Cambiado el hover */}
            Home
          </Link>
        </li>
        <li>
          <Link href="/Users" className="text-lg text-[#333] hover:text-[#FFB385] transition duration-300"> {/* Cambiado el hover */}
            Users
          </Link>
        </li>
        <li>
          <Link href="/Store" className="text-lg text-[#333] hover:text-[#FFB385] transition duration-300"> {/* Cambiado el hover */}
            Store
          </Link>
        </li>
        <li>
          {isAuthenticated ? <UserMenu /> : <LoginButton />}
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;