'use client';

import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useDispatch } from 'react-redux';
import { clearUser } from '../redux/slices/userSlice';
import useFetchUser from 'src/hooks/useFetchUser';
import useRegisterUser from 'src/hooks/useRegisterUser';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import LoadingSpinner from './LoadingSpinner';

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, isAuthenticated, user, getAccessTokenSilently } =
    useAuth0();
  const dispatch = useDispatch();

  const {
    fetchedUser,
    fetchError,
    refetchUser,
    isLoading: isUserLoading,
  } = useFetchUser(user);
  const { register, isRegistering } = useRegisterUser();

  useEffect(() => {
    const handleUserRegistration = async () => {
      if (isLoading || isRegistering || isUserLoading) return;

      if (isAuthenticated && user) {
        if (fetchedUser) {
          console.log('Usuario ya existe, cargando datos...');
        } else if (fetchError && isFetchBaseQueryError(fetchError)) {
          if (fetchError.status === 404) {
            console.log('Usuario no registrado, intentando registrar...');
            try {
              const accessToken = await getAccessTokenSilently();
              const userData = {
                nickname: user.nickname || 'Default Nickname',
                email: user.email || 'default@example.com',
                token: accessToken,
                sub: user.sub || '',
              };

              await register(userData);
              console.log('Usuario registrado exitosamente');
              await refetchUser();
            } catch (registrationError) {
              console.error(
                'Error al registrar el usuario:',
                getErrorMessage(registrationError),
              );
            }
          } else if (fetchError.status === 409) {
            console.log('Error registrando el usuario: Usuario ya existe');
            await refetchUser();
          } else {
            console.error(
              'Error obteniendo el usuario:',
              getErrorMessage(fetchError),
            );
          }
        }
      } else if (!isAuthenticated) {
        dispatch(clearUser());
      }
    };

    handleUserRegistration();
  }, [
    isLoading,
    isAuthenticated,
    user,
    fetchedUser,
    fetchError,
    refetchUser,
    dispatch,
    getAccessTokenSilently,
    register,
    isRegistering,
    isUserLoading,
  ]);

  if (isLoading || isUserLoading) {
    return (
      <div
        className="flex items-center bg-[#FDE8C9] p-2 rounded-lg shadow-md h-12 min-h-screen w-full justify-center"
        style={{ backgroundColor: 'rgba(253, 232, 201, 0.8)' }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  return <>{children}</>;
};

// Función para verificar si el error es de tipo FetchBaseQueryError
function isFetchBaseQueryError(error: any): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error;
}

// Función para obtener el mensaje de error
function getErrorMessage(error: FetchBaseQueryError | unknown): string {
  if (isFetchBaseQueryError(error)) {
    return `Error ${error.status}: ${JSON.stringify(error.data)}`;
  } else if (error instanceof Error) {
    return error.message;
  }
  return 'Ocurrió un error desconocido';
}

export default AuthWrapper;
