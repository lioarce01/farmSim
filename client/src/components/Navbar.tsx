'use client'

import Link from "next/link";
import LogoutButton from "src/components/logout";
import LoginButton from "src/components/login";
import { useSelector } from "react-redux";
import { RootState } from "src/redux/store/store";

const Navbar = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  console.log("User state:", user)
  return (
    <nav className="bg-[#B5EAD7] p-4">
      <ul className="flex justify-end p-2 items-center">
        <li className="mx-4">
          <Link href="/" className="text-black">Home</Link>
        </li>
        <li className="mx-4">
          <Link href="/about" className="text-black">About</Link>
        </li>
        <li className="mx-4">
          <Link href="/contact" className="text-black">Contact</Link>
        </li>
        <li>
          {user && user.nickname ? (
            <>
              <span className="mr-4">{user.nickname}</span>
              <LogoutButton />
            </>
          ) : (
            <LoginButton />
          )}
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;