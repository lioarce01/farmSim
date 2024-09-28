import { useEffect } from 'react';
import { useGetUserBySubQuery } from '../redux/api/users'; // Ajusta la ruta según tu estructura
import { useAuth0 } from '@auth0/auth0-react';
import { setUser } from 'src/redux/slices/userSlice';
import { useDispatch } from 'react-redux';

const useFetchUser = () => {
  const { user } = useAuth0(); // Obtén el usuario de Auth0
  const dispatch = useDispatch()
  const { data, error, isLoading, refetch } = useGetUserBySubQuery(user?.sub || '', {
    skip: !user?.sub, // Solo ejecutar la consulta si el sub está disponible
  });

  useEffect(() => {
    if (data) {
      dispatch(setUser({
        nickname: data.nickname,
        email: data.email,
        token: user?.sub || '',
        sub: user?.sub || '',
        balanceToken: data.balanceToken || 0 
      }));
    }
  }, [data, dispatch, user]);

  return { user: data, error, isLoading, refetch };
};

export default useFetchUser
