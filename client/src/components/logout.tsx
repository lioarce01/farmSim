'use client'

import { useAuth0 } from "@auth0/auth0-react";
import { useDispatch } from "react-redux";
import { clearUser } from "src/redux/slices/userSlice";

const LogoutButton = () => {
  const { logout } = useAuth0();
  const dispatch = useDispatch();

  const handleLogout = () => {
    // Limpia el usuario antes de salir
    dispatch(clearUser());

    // Realiza el logout
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
