'use client';

import { useAuth0 } from '@auth0/auth0-react';
import LogoutButton from './logout';

const UserMenu: React.FC = () => {
  const { user } = useAuth0();

  return (
    <div className="flex items-center">
      {user && (
        <>
          <span className="mr-4 text-black">{user.nickname || user.name}</span>
          <LogoutButton />
        </>
      )}
    </div>
  );
};

export default UserMenu;