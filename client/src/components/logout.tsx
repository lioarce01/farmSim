'use client'

import { useAuth0 } from "@auth0/auth0-react";

const LogoutButton = () => {
  const { logout } = useAuth0();

  const handleLogout = () => {
    logout({
      returnTo: window.location.origin,
    } as any); 
  };

  return (
    <button 
      onClick={handleLogout}
      className="px-4 py-2 bg-[#FFC1A1] text-[#333] rounded-full hover:bg-[#FFB385] transition duration-300 shadow-md font-semibold"
    >
      Logout
    </button>
  );
};

export default LogoutButton;