'use client';

import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = () => {
  const { loginWithPopup, user, isAuthenticated, isLoading } = useAuth0();

  const handleLogin = async () => {
    try {
      await loginWithPopup();
      
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <button 
      onClick={handleLogin}
      className="px-4 py-2 bg-[#FFC1A1] text-[#333] rounded-full hover:bg-[#FFB385] transition duration-300 shadow-md font-semibold"
    >
      Login
    </button>
  );
};

export default LoginButton;