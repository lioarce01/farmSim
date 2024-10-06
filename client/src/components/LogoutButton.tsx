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
      className="px-4 py-2 w-full text-left text-[#172c1f] hover:bg-[#FFC1A1] transition duration-300 font-semibold rounded-b-lg"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
