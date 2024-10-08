'use client';

import { useDispatch } from 'react-redux';
import { setError, setLoading, setUser } from '../redux/slices/userSlice';
import { useCallback } from 'react';
import { useRegisterUserMutation } from '../redux/api/users';

interface ApiError {
  status: number;
  data?: {
    message: string;
  };
}

const useRegisterUser = () => {
  const [registerUser, { isLoading: isRegistering }] =
    useRegisterUserMutation();
  const dispatch = useDispatch();

  const register = useCallback(
    async (userData: any) => {
      if (!userData.sub || !userData.email) {
        console.error('Datos del usuario inválidos:', userData);
        return;
      }
      dispatch(setLoading(true));

      try {
        const registeredUser = await registerUser(userData).unwrap();
        dispatch(setUser(registeredUser));
        return registeredUser;
      } catch (error) {
        const err = error as ApiError;

        if (err.status === 409) {
          dispatch(
            setError('El usuario ya existe. Por favor intenta con otro.'),
          );
          console.error('Error registrando el usuario:', err.data?.message);
        } else if (error instanceof Error) {
          dispatch(setError('Error durante el registro del usuario'));
          console.error('Error registrando el usuario:', error.message);
        } else {
          dispatch(setError('Error desconocido durante el registro'));
          console.error('Error desconocido registrando el usuario');
        }
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, registerUser],
  );

  return { register, isRegistering };
};

export default useRegisterUser;
