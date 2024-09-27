'use client';

import { useSelector } from 'react-redux';
import { RootState } from 'src/redux/store/store'; // Asegúrate de que esta importación es correcta
import useFetchUser from '../hooks/useFetchUser'; // Importa el hook
import LogoutButton from '../components/logout';
import { FaUserCircle, FaCoins, FaCaretDown } from 'react-icons/fa';
import { useState } from 'react';

const UserMenu: React.FC = () => {
  const { user: fetchedUser, error, isLoading } = useFetchUser(); // Usa el hook para obtener el usuario
  const user = useSelector((state: RootState) => state.user); // Obtén el estado del usuario de Redux
  const [isOpen, setIsOpen] = useState(false); // Estado para manejar la apertura del menú desplegable

  // Manejo de estados de carga y error
  if (isLoading) return <div className="text-[#A8D5BA]">Loading user info...</div>;
  if (error) return <div className="text-red-500">{`Error: ${error}`}</div>;

  const toggleMenu = () => {
    setIsOpen(!isOpen); // Alternar el estado del menú desplegable
  };

  return (
    <div className="relative flex items-center bg-[#FDE8C9] p-2 rounded-lg shadow-md h-12">
      {fetchedUser && (
        <>
          <FaUserCircle className="text-[#A8D5BA] mr-2" size={20} />
          <span className="mr-2 text-[#172c1f] font-semibold text-sm cursor-pointer" onClick={toggleMenu}>
            {fetchedUser.nickname || user.nickname} <FaCaretDown className="inline-block ml-1" />
          </span>
          <FaCoins className="text-[#FFB385] mr-2" size={20} />
          <span className="mr-4 text-[#172c1f] font-medium text-sm">
            Balance Tokens: <span className="text-[#FFB385]">{fetchedUser.balanceToken || 0}</span>
          </span>
          {/* Menú desplegable */}
          {isOpen && (
  <div className="absolute right-0 mt-28 w-48 bg-[#FDE8C9] rounded-b-lg z-10 shadow-lg border border-[#FFC1A1]">
    <div className="p-2 w-full">
      <LogoutButton />
    </div>
  </div>
)}
        </>
      )}
    </div>
  );
};

export default UserMenu;
