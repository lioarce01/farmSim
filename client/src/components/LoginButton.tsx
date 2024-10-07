'use client';

import { useAuth0 } from '@auth0/auth0-react';

const LoginButton = () => {
  const { loginWithPopup } = useAuth0();

  const handleLogin = async () => {
    try {
      await loginWithPopup();
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="px-6 py-3 bg-[#8d3c19] border-r-4 border-b-4 border-[#632911] text-[#FDE8C9] font-extrabold rounded-lg shadow-lg transition duration-300 transform hover:scale-105 hover:bg-[#7c3617] hover:text-[#ffb98e]"
    >
      Login
    </button>
  );
};

export default LoginButton;
