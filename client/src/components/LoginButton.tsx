'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '../../components/ui/button';
import { LogIn } from 'lucide-react';

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
    <Button
      onClick={handleLogin}
      className="w-full text-left text-white font-extrabold bg-[#252538] hover:bg-[#2f2f47] transition duration-300 rounded-lg flex items-center justify-center"
    >
      <LogIn className="mr-2" size={15} />
      Login
    </Button>
  );
};

export default LoginButton;
