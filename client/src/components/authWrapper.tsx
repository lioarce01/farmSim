'use client'

import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, clearUser } from '../redux/slices/userSlice'; // Asegúrate de importar el slice correcto
import useRegisterUser from '../hooks/useRegisterUser';
import { RootState } from '../redux/store/store'; // Importa el tipo de estado raíz

const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, error, isLoading } = useAuth0();
  const dispatch = useDispatch();
  
  // Obtencion del user
  const currentUser = useSelector((state: RootState) => state.user);

  useRegisterUser();

  // Función para verificar si el usuario ya existe en el estado de Redux
  const userExistsInRedux = (user: any) => {
    return currentUser.nickname === user.nickname && currentUser.email === user.email;
  };

  useEffect(() => {
    if (user) {
      console.log('User data:', user);
      
      // Asegúrate de que el estado no esté ya configurado
      if (!userExistsInRedux(user)) {
        dispatch(setUser({
          nickname: user.nickname || 'guest',
          email: user.email || 'no email',
          token: user.sub || '',
        }));
      }
    } else if (!isLoading) {
      console.log('No user found, clearing user data.');
      dispatch(clearUser());
    }
  }, [user, isLoading, dispatch, currentUser]); // Asegúrate de incluir currentUser en las dependencias

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <>{children}</>;
};

export default AuthWrapper;
