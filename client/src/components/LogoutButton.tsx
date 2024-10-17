'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useDispatch } from 'react-redux';
import { clearUser } from 'src/redux/slices/userSlice';
import { Button } from '../../components/ui/button';
import { LogOut } from 'lucide-react';

const LogoutButton = () => {
  const { logout } = useAuth0();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(clearUser());

    logout({
      logoutParams: { returnTo: window.location.origin },
    });
  };

  return (
    <Button
      onClick={handleLogout}
      className="text-white transition duration-300 rounded-b-lg"
    >
      <LogOut className="mr-4" size={15} />
      Logout
    </Button>
  );
};

export default LogoutButton;
