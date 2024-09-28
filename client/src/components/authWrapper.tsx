'use client'

import { useEffect } from 'react';
import { useAuth0, User } from '@auth0/auth0-react';
import { useDispatch } from 'react-redux';
import { setUser, clearUser } from '../redux/slices/userSlice';
import useRegisterUser from 'src/hooks/useRegisterUser';

const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const dispatch = useDispatch();
  const { register } = useRegisterUser();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Datos del usuario a enviar al backend
        const userData = {
          nickname: user.nickname || 'Default Nickname',
          email: user.email || 'default@example.com',
          token: user.sub || '',
          sub: user.sub || '',
          balanceToken: user.balanceToken,
        };

        // Registra el usuario en el backend
        register(userData);
        
        // Establece el usuario en el estado de Redux
        // dispatch(setUser(userData));
      } else {
        dispatch(clearUser());
      }
    }
  }, [isAuthenticated, user, isLoading, dispatch, register]);

  return <>{children}</>;
};

export default AuthWrapper;
