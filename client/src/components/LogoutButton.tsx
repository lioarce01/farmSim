'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useDispatch } from 'react-redux';
import { clearUser } from 'src/redux/slices/userSlice';

const LogoutButton = () => {
  const { logout } = useAuth0();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(clearUser());

    logout({
      returnTo: window.location.origin,
    } as any);
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 w-full text-left text-[#663b1e] font-extrabold bg-[#FFF5D1] hover:bg-[#FFB385] hover:text-[#FFF5D1] transition duration-300 rounded-b-lg"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
