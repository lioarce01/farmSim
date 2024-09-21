'use client'

import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { useRegisterUserMutation } from '../redux/api/users'; // Asegúrate de que la ruta sea correcta

const LoginButton = () => {
  const { loginWithPopup, user, isAuthenticated } = useAuth0();
  const [registerUser] = useRegisterUserMutation();

  const handleLogin = async () => {
    try {
      await loginWithPopup();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  useEffect(() => {
    const registerNewUser = async () => {
      if (isAuthenticated && user) {
        try {
          await registerUser({
            nickname: user.nickname || user.name,
            email: user.email,
          }).unwrap();
        } catch (error) {
          console.error("Error registering user:", error);
        }
      }
    };

    registerNewUser();
  }, [isAuthenticated, user, registerUser]);

  return (
    <div className="items-center px-4 py-2 mr-4 text-white bg-[#d6635f] rounded-2xl hover:bg-[#e76b67] transition duration-300">
      <button onClick={handleLogin} className="px-2 font-bold">
        Login
      </button>
    </div>
  );
};

export default LoginButton;
