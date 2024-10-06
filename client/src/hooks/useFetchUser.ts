'use client';

import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useGetUserBySubQuery } from '../redux/api/users';
import { useDispatch } from 'react-redux';
import { setUser } from 'src/redux/slices/userSlice';
import { Role, User } from 'src/types';

const useFetchUser = (user: any) => {
  const dispatch = useDispatch();
  const { getAccessTokenSilently } = useAuth0();

  const {
    data,
    error,
    isLoading,
    refetch: refetchUser,
  } = useGetUserBySubQuery(user?.sub || '', {
    skip: !user || !user.sub,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.sub) {
        try {
          const accessToken = await getAccessTokenSilently();
          const response = await refetchUser();

          if (response.data) {
            const fetchedData: User = response.data;

            if (fetchedData.nickname && fetchedData.email) {
              dispatch(
                setUser({
                  nickname: fetchedData.nickname,
                  email: fetchedData.email,
                  token: accessToken,
                  sub: fetchedData.sub,
                  balanceToken: fetchedData.balanceToken || 0,
                  role: fetchedData.role as Role,
                }),
              );
            } else {
              console.warn('Datos de usuario incompletos:', fetchedData);
            }
          } else {
            console.warn('Usuario no registrado aún en el backend');
          }
        } catch (err) {
          console.error('Error obteniendo el usuario:', err);
        }
      }
    };

    fetchUserData();

    const intervalId = setInterval(fetchUserData, 5000);
    return () => clearInterval(intervalId);
  }, [user?.sub, refetchUser]);

  return { fetchedUser: data, fetchError: error, isLoading, refetchUser };
};

export default useFetchUser;
