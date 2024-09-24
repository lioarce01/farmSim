import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useDispatch } from 'react-redux';
import { setUser, clearUser } from '../redux/slices/authSlice';
import useRegisterUser from '../hooks/useRegisterUser';

const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, error, isLoading } = useAuth0();
  const dispatch = useDispatch();
  useRegisterUser(); // Llama al hook aquí

  useEffect(() => {
    if (user) {
      dispatch(setUser({
        user: { 
          nickname: user.nickname || 'guest', 
          email: user.email || 'no email' 
        },
        token: user.sub || '', // Asegúrate de que esto está presente
      }));
    } else if (!isLoading) {
      dispatch(clearUser());
    }
  }, [user, isLoading, dispatch]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <>{children}</>;
};

export default AuthWrapper;