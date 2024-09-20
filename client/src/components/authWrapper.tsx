import { useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/authSlice';

const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, error, isLoading } = useUser();
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      dispatch(setUser({
        user: { username: user.name || 'guest', 
          email: user.email || 'no email'
        },
        token: typeof user?.token === 'string' ? user.token : '', // Proporciona un valor por defecto ('') cuando el token es undefined o null
      }));
    }
  }, [user, dispatch]);

  if (isLoading) return <div>Loading...</div>;
  if (error instanceof Error) {
    return <div>Error: {error?.message}</div>;
  }

  return <>{children}</>;
};

export default AuthWrapper;