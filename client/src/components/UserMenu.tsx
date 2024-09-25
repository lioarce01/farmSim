'use client';

import { useSelector } from 'react-redux';
import { RootState } from 'src/redux/store/store'; // Asegúrate de importar correctamente tu tipo de estado raíz
import LogoutButton from '../components/logout';


const UserMenu: React.FC = () => {
  // Obtiene el usuario del estado de Redux
  const user = useSelector((state: RootState) => state.user); // Asegúrate de que el nombre del slice es correcto


  return (
    <div className="relative flex items-center">
      {user && user.nickname && (
        <>
          <span className="mr-4 text-[#172c1f]">
            {user.nickname}
          </span>
          <LogoutButton />
        </>
      )}
    </div>
  );
};

export default UserMenu;
