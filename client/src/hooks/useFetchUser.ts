'use client'

import { useEffect } from 'react';
import { useGetUserBySubQuery } from '../redux/api/users';
import { useAuth0 } from '@auth0/auth0-react';
import { setUser } from 'src/redux/slices/userSlice';
import { useDispatch } from 'react-redux';
import { Role } from 'src/types';

const useFetchUser = () => {
  const { user } = useAuth0();
  const dispatch = useDispatch();
  
  const { data, error, isLoading, refetch: refetchUser } = useGetUserBySubQuery(user?.sub || '', {
    skip: !user || !user.sub, 
  });

  useEffect(() => {
    if (user?.sub && !isLoading && !error) {
      const intervalId = setInterval(async () => {
        try {
          const response = await refetchUser();
          if (response.data) {
            const fetchedData = response.data;
            dispatch(setUser({
              nickname: fetchedData.nickname,
              email: fetchedData.email,
              token: user.sub || '',
              sub: user.sub || '',
              balanceToken: fetchedData.balanceToken || 0,
              role: fetchedData.role as Role,
            }));
            clearInterval(intervalId); // Detener el polling si se obtiene el usuario
          } else {
            console.warn('Usuario no registrado aún en el backend');
          }
        } catch (error) {
          console.error('Error obteniendo el usuario:', error);
          clearInterval(intervalId);
        }
      }, 5000); // Intervalo mayor para evitar sobrecargar el servidor
  
      return () => clearInterval(intervalId); // Limpiar el intervalo al desmontar
    }
  }, [user, refetchUser, error]);
  
  

  useEffect(() => {
    if (error) {
      let errorMessage: string;

      if ('status' in error) {
        errorMessage = `Error ${error.status}: ${JSON.stringify(error.data)}`;
      } else {
        errorMessage = error.message || 'Ocurrió un error desconocido';
      }

      console.error('Error al obtener el usuario:', errorMessage);
    }
  }, [error]);

  return { user: data, error, isLoading, refetchUser };
};

export default useFetchUser;
