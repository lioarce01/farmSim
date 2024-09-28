'use client'

import { useRegisterUserMutation } from '../redux/api/users';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/userSlice';
import { useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import useFetchUser from './useFetchUser';

interface ApiError {
  status: number;
  data?: {
    message: string;
  };
}

const useRegisterUser = () => {
  const [registerUser] = useRegisterUserMutation();
  const dispatch = useDispatch();
  const { user } = useAuth0(); // Obtén el usuario de Auth0
  const { refetch } = useFetchUser()

  const register = useCallback(async (userData: any) => {
    try {
      const result = await registerUser(userData).unwrap();
      console.log('registration result: ', result);
      if (result && user) {
        dispatch(setUser({
          nickname: user.nickname || '', 
          email: user.email || '', 
          token: user.sub || '',
          sub: user.sub || '',
          balanceToken: result.balanceToken || 0
        }));

        refetch()
        
      } else {
        console.error('user is undefined or registration result is null')
      }
    } catch (error) {
      const err = error as ApiError;
      if (err.status === 409 && err.data?.message) {
        console.error('Error registrando el usuario:', err.data.message);
      } else if (error instanceof Error) {
        console.error('Error registrando el usuario:', error.message);
      } else {
        console.error('Error registrando el usuario: Error desconocido');
      }
    }
  }, [dispatch, registerUser, user]); 

  return { register };
};

export default useRegisterUser;
