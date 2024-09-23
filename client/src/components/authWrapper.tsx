import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/authSlice';

const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, error, isLoading } = useAuth0();
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      dispatch(setUser({
        user: { 
          nickname: user.nickname || 'guest', 
          email: user.email || 'no email' 
        },
        token: user.sub || '', // Proporciona el token o un valor por defecto
      }));
    }
  }, [user, dispatch]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <>{children}</>;
};

export default AuthWrapper;