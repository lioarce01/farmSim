'use client'

import Link from "next/link"
import LogoutButton from "src/services/auth/logout";
import LoginButton from "src/services/auth/login";
import { useSelector } from "react-redux";
import { RootState } from "src/store/store";

const Navbar = () => {
  const { user } = useSelector((state: RootState) => state.auth);

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
                {user ? (
                  <>
                    <span>{user.name}</span>
                      <LogoutButton>Logout</LogoutButton>
                  </>
                    ) : (
                      <LoginButton>Login</LoginButton>
                  )}
                </li>
            </ul>
        </nav>
    )
}

export default Navbar