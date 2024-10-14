'use client';

import { useSelector } from 'react-redux';
import { useState } from 'react';
import Navbar from '../../components/Navbar';
import {
  useAddTokensMutation,
  useConvertUserMutation,
  useGetUsersQuery,
} from '../../redux/api/users';
import { User } from '../../types';
import { RootState } from 'src/redux/store/store';
import ProtectAdminRoute from 'src/components/ProtectAdminRoute';

const UsersPage = () => {
  const { data, error, isLoading, refetch } = useGetUsersQuery();
  const [convertUser] = useConvertUserMutation();
  const [addTokens] = useAddTokensMutation();
  const loggedUserRole = useSelector((state: RootState) => state.user.role);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [tokensToAdd, setTokensToAdd] = useState('');

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen text-[#B5EAD7] text-lg">
        Loading...
      </div>
    );

  if (error) {
    const errorMessage =
      'status' in error
        ? `Error: ${error.status} - ${error.data}`
        : 'Error desconocido';
    return (
      <div className="flex justify-center items-center h-screen text-red-600 text-lg">
        {errorMessage}
      </div>
    );
  }

  const handleConvertToAdmin = async (sub: string) => {
    try {
      await convertUser({ sub }).unwrap();
      refetch();
    } catch (e) {
      console.error('Error al convertir el usuario:', e);
      alert('Error al convertir al usuario');
    }
  };

  const handleOpenPopup = (sub: string) => {
    setSelectedUser(sub);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setSelectedUser(null);
    setIsPopupOpen(false);
    setTokensToAdd('');
  };

  const handleAddTokens = async () => {
    if (selectedUser && tokensToAdd) {
      try {
        await addTokens({
          userSub: selectedUser,
          tokensToAdd: parseInt(tokensToAdd, 10),
        }).unwrap();
        refetch();
        handleClosePopup();
      } catch (e) {
        console.error('Error al añadir tokens:', e);
        alert('Error al añadir tokens');
      }
    }
  };

  return (
    <ProtectAdminRoute>
      <div className="w-full min-h-screen bg-[#FFF5D1] text-gray-800">
        <Navbar />
        <div className="pt-24 px-6">
          <h1 className="text-3xl font-bold text-center text-[#A8D5BA] mb-6">
            Usuarios
          </h1>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 shadow-lg rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-[#B5EAD7] text-left">
                  <th className="py-4 px-6 border-b font-semibold text-[#17271e]">
                    Nickname
                  </th>
                  <th className="py-4 px-6 border-b font-semibold text-[#17271e]">
                    Balance Tokens
                  </th>
                  <th className="py-4 px-6 border-b font-semibold text-[#17271e]">
                    Inventory Items
                  </th>
                  <th className="py-4 px-6 border-b font-semibold text-[#17271e]">
                    Role
                  </th>
                  {loggedUserRole === 'ADMIN' && (
                    <th className="py-4 px-6 border-b font-semibold text-[#17271e]">
                      Convert
                    </th>
                  )}
                  {loggedUserRole === 'ADMIN' && (
                    <th className="py-4 px-6 border-b font-semibold text-[#17271e]">
                      Add Tokens
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {data?.map((user: User) => (
                  <tr
                    key={user.id}
                    className="hover:bg-[#fdece1] transition-colors duration-300 ease-in-out"
                  >
                    <td className="py-4 px-6 border-b text-[#17271e]">
                      {user.nickname}
                    </td>
                    <td className="py-4 px-6 border-b text-[#17271e]">
                      {user.balanceToken}
                    </td>
                    <td className="py-4 px-6 border-b text-[#17271e]">
                      {user.inventory &&
                      user.inventory.seeds &&
                      user.inventory.waters
                        ? user.inventory.seeds.length +
                          user.inventory.waters.length
                        : 0}
                    </td>
                    <td className="py-4 px-6 border-b text-[#17271e]">
                      {user.role}
                    </td>
                    {loggedUserRole === 'ADMIN' && (
                      <td className="py-4 px-6 border-b text-[#17271e]">
                        <button
                          className="px-4 py-2 bg-[#FFC1A1] text-white rounded-lg hover:bg-[#FFB385] transition duration-300"
                          onClick={() => handleConvertToAdmin(user.sub)}
                        >
                          {user.role === 'USER'
                            ? 'Convert to Admin'
                            : 'Convert to User'}
                        </button>
                      </td>
                    )}
                    {loggedUserRole === 'ADMIN' && (
                      <td className="py-4 px-6 border-b text-[#17271e]">
                        <button
                          className="px-4 py-2 bg-[#FFC1A1] text-white rounded-lg hover:bg-[#FFB385] transition duration-300"
                          onClick={() => handleOpenPopup(user.sub)}
                        >
                          Añadir Tokens
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {isPopupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-[#FFF5D1] p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-[#A8D5BA]">
                Añadir Tokens
              </h2>
              <input
                type="number"
                value={tokensToAdd}
                onChange={(e) => setTokensToAdd(e.target.value)}
                className="border border-[#B5EAD7] rounded px-3 py-2 mb-4 w-full bg-white text-[#17271e] focus:outline-none focus:ring-2 focus:ring-[#A8D5BA]"
                placeholder="Tokens to add"
              />
              <div className="flex justify-center space-x-3">
                <button
                  onClick={handleAddTokens}
                  className="px-4 py-2 bg-[#B5EAD7] text-[#17271e] rounded-lg hover:bg-[#A8D5BA] transition duration-300 font-semibold"
                >
                  Añadir
                </button>
                <button
                  onClick={handleClosePopup}
                  className="px-4 py-2 bg-[#FFC1A1] text-white rounded-lg hover:bg-[#FFB385] transition duration-300 font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectAdminRoute>
  );
};

export default UsersPage;
