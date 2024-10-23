'use client';

import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useDispatch } from 'react-redux';
import { clearUser, setUser } from '../redux/slices/userSlice';
import useFetchUser from 'src/hooks/useFetchUser';
import useRegisterUser from 'src/hooks/useRegisterUser';
import LoadingSpinner from './LoadingSpinner';
import { Role } from 'src/types';

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const {
    isLoading: isAuth0Loading,
    isAuthenticated,
    user,
    getAccessTokenSilently,
  } = useAuth0();
  const dispatch = useDispatch();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { fetchedUser, fetchUserData } = useFetchUser(user);
  const { register } = useRegisterUser();

  useEffect(() => {
    const handleUserAuthentication = async () => {
      if (isAuth0Loading) return;

      if (!isAuthenticated || !user) {
        dispatch(clearUser());
        localStorage.removeItem('user');
        setIsInitialLoad(false);
        return;
      }

      try {
        const accessToken = await getAccessTokenSilently();
        let userData = null;

        if (fetchedUser) {
          // User exists, update with latest data
          userData = {
            ...fetchedUser,
            token: accessToken,
          };
        } else {
          // User doesn't exist, try to register
          const registeredUser = await register({
            nickname: user.nickname || 'Default Nickname',
            email: user.email || 'default@example.com',
            token: accessToken,
            sub: user.sub || '',
          });
          if (registeredUser) {
            userData = await fetchUserData();
          }
        }

        if (userData) {
          dispatch(
            setUser({
              ...userData,
              token: accessToken,
              role: userData.role as Role,
              balanceToken: fetchedUser?.balanceToken ?? 0,
            }),
          );
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (error) {
        console.error('Error during user authentication:', error);
      } finally {
        setIsInitialLoad(false);
      }
    };

    handleUserAuthentication();
  }, [
    isAuth0Loading,
    isAuthenticated,
    user,
    fetchedUser,
    dispatch,
    getAccessTokenSilently,
    register,
    fetchUserData,
  ]);

  if (isAuth0Loading || isInitialLoad) {
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

export default AuthWrapper;
