'use client'

import { useEffect } from 'react';
import { useGetUserBySubQuery } from '../redux/api/users';
import { useAuth0 } from '@auth0/auth0-react';
import { setUser } from 'src/redux/slices/userSlice';
import { useDispatch } from 'react-redux';
import { Role, User } from 'src/types';

interface UserData {
  nickname: string;
  email: string;
  balanceToken: number;
  role: Role;
}

const useFetchUser = () => {
  const { user } = useAuth0();
  const dispatch = useDispatch();
  
  const { data, error, isLoading, refetch: refetchUser } = useGetUserBySubQuery(user?.sub || '', {
    skip: !user || !user.sub,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.sub) {
        try {
          const response = await refetchUser();
          if (response.data) {
            const fetchedData: User = response.data; // Asume que 'data' tiene esta estructura
            dispatch(setUser({
              nickname: fetchedData.nickname,
              email: fetchedData.email,
              token: user.sub,
              sub: user.sub,
              balanceToken: fetchedData.balanceToken || 0,
              role: fetchedData.role as Role,
            }));
          } else {
            console.warn('Usuario no registrado aún en el backend');
          }
        } catch (err) {
          console.error('Error obteniendo el usuario:', err);
        }
      }
    };

    const intervalId = setInterval(fetchUserData, 5000);

    return () => clearInterval(intervalId); // Limpia el intervalo al desmontar
  }, [user?.sub, refetchUser]); // Solo dependencias necesarias

  useEffect(() => {
    if (error) {
      const errorMessage = 'status' in error 
        ? `Error ${error.status}: ${JSON.stringify(error.data)}`
        : error.message || 'Ocurrió un error desconocido';
      console.error('Error al obtener el usuario:', errorMessage);
    }
  }, [error]);

  return { user: data, error, isLoading, refetchUser };
};

export default useFetchUser;
