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
import { Button } from '../../../components/ui/button';
import { Pagination } from '../../../components/ui/pagination';

const UsersPage = () => {
  const { data, error, isLoading, refetch } = useGetUsersQuery();
  const [convertUser] = useConvertUserMutation();
  const [addTokens] = useAddTokensMutation();
  const loggedUserRole = useSelector((state: RootState) => state.user.role);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [tokensToAdd, setTokensToAdd] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const displayedUsers = data?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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
      <div className="w-full min-h-screen bg-[#14141b] text-white">
        <Navbar />
        <div className="pt-24 px-6">
          <h1 className="text-3xl font-bold text-center mb-6">Users</h1>
          <div className="overflow-x-auto">
            <div className="flex justify-start mb-4 font-bold">
              <p>Total users: {data?.length}</p>
            </div>
            <table className="min-w-full bg-[#14141b] shadow-lg rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-[#181820] text-left">
                  <th className="py-4 px-6 border-b font-semibold">Nickname</th>
                  <th className="py-4 px-6 border-b font-semibold">
                    Balance Tokens
                  </th>
                  {/* <th className="py-4 px-6 border-b font-semibold">
                    Inventory Items
                  </th> */}
                  <th className="py-4 px-6 border-b font-semibold">Role</th>
                  {loggedUserRole === 'ADMIN' && (
                    <>
                      <th className="py-4 px-6 border-b font-semibold">
                        Convert
                      </th>
                      <th className="py-4 px-6 border-b font-semibold">
                        Add Tokens
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {displayedUsers?.map((user: User) => (
                  <tr
                    key={user.id}
                    className="hover:bg-[#1b1b24] transition-colors duration-300 ease-in-out"
                  >
                    <td className="py-4 px-6 border-b border-[#2a2a3b]">
                      {user.nickname}
                    </td>
                    <td className="py-4 px-6 border-b border-[#2a2a3b]">
                      {user.balanceToken}
                    </td>
                    {/* <td className="py-4 px-6 border-b border-[#2a2a3b]">
                      {(user.inventory?.seeds?.length ?? 0) +
                        (user.inventory?.waters?.length ?? 0)}
                    </td> */}
                    <td className="py-4 px-6 border-b border-[#2a2a3b]">
                      {user.role}
                    </td>
                    {loggedUserRole === 'ADMIN' && (
                      <>
                        <td className="py-4 px-6 border-b border-[#2a2a3b]">
                          <Button
                            onClick={() => handleConvertToAdmin(user.sub)}
                            className="bg-[#22222e] text-white rounded-lg hover:bg-[#272735] transition duration-300"
                          >
                            {user.role === 'USER'
                              ? 'Convert to Admin'
                              : 'Convert to User'}
                          </Button>
                        </td>
                        <td className="py-4 px-6 border-b border-[#2a2a3b]">
                          <Button
                            onClick={() => handleOpenPopup(user.sub)}
                            className="bg-[#22222e] text-white rounded-lg hover:bg-[#272735] transition duration-300"
                          >
                            Add Tokens
                          </Button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Paginación */}
            <div className="flex justify-center mt-4">
              <Pagination className=" text-white rounded-lg shadow-lg py-2">
                {/* Implementa la lógica de paginación aquí */}
                {Array.from(
                  { length: Math.ceil((data?.length || 0) / itemsPerPage) },
                  (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 mx-1 ${currentPage === i + 1 ? 'bg-[#22222e] text-white rounded-lg' : ''}`}
                    >
                      {i + 1}
                    </button>
                  ),
                )}
              </Pagination>
            </div>
          </div>
        </div>

        {isPopupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center">
            <div className="bg-[#14141b] p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-white">Add Tokens</h2>
              <input
                type="number"
                value={tokensToAdd}
                onChange={(e) => setTokensToAdd(e.target.value)}
                className="border-2 border-[#20202b] rounded px-3 py-2 mb-4 w-full bg-[#14141b] focus:outline-none focus:ring-3 focus:ring-[#20202b]"
                placeholder="Enter token amount"
              />
              <div className="flex justify-end space-x-3">
                <Button
                  onClick={handleAddTokens}
                  className="bg-[#20202b] hover:bg-[#272735] rounded-lg transition duration-300 font-semibold"
                >
                  Add
                </Button>
                <Button
                  onClick={handleClosePopup}
                  className="bg-[#20202b] hover:bg-[#272735] text-white rounded-lg transition duration-300 font-semibold"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectAdminRoute>
  );
};

export default UsersPage;
