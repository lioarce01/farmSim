'use client'

import { useRegisterUserMutation } from '../redux/api/users';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/userSlice';
import { useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

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

  const register = useCallback(async (userData: any) => {
    try {
      const result = await registerUser(userData).unwrap();
      console.log('registration result: ', result);
      if (result && user) {
        dispatch(setUser({
          nickname: user.nickname || '', // Usa el nickname de Auth0
          email: user.email || '', // Usa el email de Auth0
          token: user.sub || '', // Usa el sub de Auth0 como token (puedes ajustar según sea necesario)
        }));
      } else {
        console.error('user is undefined or registration result is null')
      }
    } catch (error) {
      // Asegúrate de que el error es de tipo ApiError
      const err = error as ApiError;
      if (err.status === 409 && err.data?.message) {
        console.error('Error registrando el usuario:', err.data.message);
      } else if (error instanceof Error) {
        // Si es un error genérico, muestra el mensaje
        console.error('Error registrando el usuario:', error.message);
      } else {
        console.error('Error registrando el usuario: Error desconocido');
      }
    }
  }, [dispatch, registerUser, user]); // Asegúrate de incluir el usuario de Auth0 como dependencia

  return { register };
};

export default useRegisterUser;
