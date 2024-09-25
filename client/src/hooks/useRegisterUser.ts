'use client'

import { useRegisterUserMutation } from '../redux/api/users';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/userSlice'; // Asegúrate de que la ruta es correcta

const useRegisterUser = () => {
  const [registerUser] = useRegisterUserMutation(); // Obtén el hook de mutación
  const dispatch = useDispatch();

  const register = async (userData: any) => {
    try {
      const result = await registerUser(userData).unwrap(); // Llama a la mutación
      
      // Solo despachar setUser aquí si la mutación fue exitosa
      if (result) {
        dispatch(setUser({
          nickname: result.nickname,
          email: result.email,
          token: result.token,
        }));
      }
    } catch (error) {
      console.error('Error registrando el usuario:', error);
    }
  };

  return { register };
};

export default useRegisterUser