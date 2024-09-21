import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/authSlice';
import { useRegisterUserMutation } from '../redux/api/users';

const useRegisterUser = () => {
  const { user, isAuthenticated } = useAuth0();
  const [registerUser] = useRegisterUserMutation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuthenticated && user) {
      const sendUserData = async () => {
        try {
          const newUser = await registerUser({
            nickname: user.nickname,
            email: user.email,
          }).unwrap();

          dispatch(setUser(newUser));
        } catch (error) {
          console.error('Error registrando el usuario:', error);
        }
      };

      sendUserData();
    }
  }, [isAuthenticated, user, registerUser, dispatch]);
};

export default useRegisterUser;