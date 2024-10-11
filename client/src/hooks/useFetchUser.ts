'use client';

import { useCallback } from 'react';
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

  const fetchUserData = useCallback(async () => {
    if (user?.sub && !isLoading) {
      try {
        const accessToken = await getAccessTokenSilently();
        const response = await refetchUser();

        if (response.data) {
          const fetchedData: User = response.data;

          if (fetchedData.nickname && fetchedData.email) {
            const userData = {
              nickname: fetchedData.nickname,
              email: fetchedData.email,
              token: accessToken,
              sub: fetchedData.sub,
              balanceToken: fetchedData.balanceToken || 0,
              role: fetchedData.role as Role,
            };
            dispatch(setUser(userData));
            localStorage.setItem('user', JSON.stringify(userData));
            return userData;
          } else {
            console.warn('Incomplete user data:', fetchedData);
          }
        } else {
          console.warn('User not yet registered in the backend');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    }
    return null;
  }, [user?.sub, isLoading, refetchUser, getAccessTokenSilently, dispatch]);

  return { fetchedUser: data, fetchError: error, isLoading, fetchUserData };
};

export default useFetchUser;
