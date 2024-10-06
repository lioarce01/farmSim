'use client';

import { useSelector } from 'react-redux';
import Navbar from '../../components/Navbar';
import {
  useConvertUserMutation,
  useGetUsersQuery,
} from '../../redux/api/users';
import { User } from '../../types';
import { RootState } from 'src/redux/store/store';
import ProtectAdminRoute from 'src/components/ProtectAdminRoute';

const UsersPage = () => {
  const { data, error, isLoading, refetch } = useGetUsersQuery();
  const [convertUser] = useConvertUserMutation();
  const loggedUserRole = useSelector((state: RootState) => state.user.role);

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
        : 'Unknown Error';
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

  return (
    <ProtectAdminRoute>
      <div className="w-full min-h-screen bg-[#FFF5D1] text-gray-800">
        <Navbar />
        <div className="pt-24 px-6">
          <h1 className="text-3xl font-bold text-center text-[#A8D5BA] mb-6">
            Users
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
                </tr>
              </thead>
              <tbody>
                {data?.map((user: User) => (
                  <tr
                    key={user.sub}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectAdminRoute>
  );
};

export default UsersPage;
