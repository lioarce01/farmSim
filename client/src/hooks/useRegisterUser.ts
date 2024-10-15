'use client';

import { useCallback } from 'react';
import { useRegisterUserMutation } from '../redux/api/users';

const useRegisterUser = () => {
  const [registerUser, { isLoading: isRegistering }] =
    useRegisterUserMutation();

  const register = useCallback(
    async (userData: any) => {
      if (!userData.sub || !userData.email) {
        console.error('Invalid user data:', userData);
        throw new Error('Invalid user data');
      }

      try {
        const registeredUser = await registerUser(userData).unwrap();
        return registeredUser;
      } catch (error: any) {
        if (error.status === 409) {
          console.log('User already exists, proceeding with login');
          return userData;
        }
        console.error('Error registering user:', error);
        throw error;
      }
    },
    [registerUser],
  );

  return { register, isRegistering };
};

export default useRegisterUser;
