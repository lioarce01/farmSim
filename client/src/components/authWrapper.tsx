'use client'

import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useDispatch } from 'react-redux';
import { setUser, clearUser } from '../redux/slices/userSlice';
import { useRegisterUserMutation, useGetUserBySubQuery } from '../redux/api/users';
import { Role } from 'src/types';

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, isAuthenticated, user } = useAuth0();
  const dispatch = useDispatch();

  const [registerUser] = useRegisterUserMutation();
  const { data: fetchedUser, refetch: refetchUser } = useGetUserBySubQuery(user?.sub || '', { skip: !user?.sub });

  useEffect(() => {
    const handleUserRegistration = async () => {
      if (isLoading) return; 
      
      if (isAuthenticated && user) {
        try {
          if (fetchedUser) {
            console.log('Usuario ya existe, cargando datos...');
            dispatch(setUser({
              nickname: fetchedUser.nickname,
              email: fetchedUser.email,
              token: user.sub || '',
              sub: user.sub || '',
              balanceToken: fetchedUser.balanceToken || 0,
              role: fetchedUser.role as Role,
            }));
          } else {
            const userData = {
              nickname: user.nickname || 'Default Nickname',
              email: user.email || 'default@example.com',
              token: user.sub || '',
              sub: user.sub || '',
            };

            console.log('Intentando registrar usuario...', userData);
            await registerUser(userData).unwrap();
            console.log('Usuario registrado exitosamente');
            
            await refetchUser(); // Esperar a que se refresquen los datos del usuario registrado
          }
        } catch (error) {
          console.error('Error durante el registro o al obtener el usuario:', error);
        }
      } else if (!isAuthenticated) {
        dispatch(clearUser());
      }
    };

    handleUserRegistration();
  }, [isLoading, isAuthenticated, user, fetchedUser, refetchUser, dispatch, registerUser]);

  if (isLoading) {
    return <div>Loading...</div>; // poner spinner
  }

  return <>{children}</>
};

export default AuthWrapper;
