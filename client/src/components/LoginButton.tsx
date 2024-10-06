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
      className="px-6 py-2 bg-[#FDE8C9] text-[#333] rounded-md hover:bg-[#FFC1A1] transition duration-300 shadow-md font-semibold"
    >
      Login
    </button>
  );
};

export default LoginButton;
