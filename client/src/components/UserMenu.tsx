'use client';

import { useSelector } from 'react-redux';
import { RootState } from 'src/redux/store/store'; // Asegúrate de que esta importación es correcta
import useFetchUser from '../hooks/useFetchUser'; // Importa el hook
import LogoutButton from '../components/logout';

const UserMenu: React.FC = () => {
  const { user: fetchedUser, error, isLoading } = useFetchUser(); // Usa el hook para obtener el usuario
  const user = useSelector((state: RootState) => state.user); // Obtén el estado del usuario de Redux

  // Manejo de estados de carga y error
  if (isLoading) return <div>Loading user info...</div>;
  if (error) return <div>{`Error: ${error}`}</div>;

  return (
    <div className="relative flex items-center">
      {fetchedUser && (
        <>
          <span className="mr-4 text-[#172c1f]">
            {fetchedUser.nickname || user.nickname}
          </span>
          <span className="mr-4 text-[#172c1f]">
            Balance Tokens: {fetchedUser.balanceToken || 0}
          </span>
          <LogoutButton />
        </>
      )}
    </div>
  );
};

export default UserMenu;
