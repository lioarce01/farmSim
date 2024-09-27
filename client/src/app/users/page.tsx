'use client'

import Navbar from '../../components/Navbar';
import { useGetUsersQuery } from '../../redux/api/users';
import { User } from '../../types'; 

const UsersPage = () => {
  const { data, error, isLoading } = useGetUsersQuery();

  if (isLoading) return <div>Loading...</div>;

  if (error) {
    const errorMessage = 'status' in error ? `Error: ${error.status} - ${error.data}` : 'Unknown Error';
    return <div>{errorMessage}</div>;
  }

  return (
    <div className='w-full'>
      <Navbar />
      <div className="pt-24 px-4">
        <h1 className="text-2xl font-bold text-[#A8D5BA] mb-4 text-center">Users</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 shadow-lg rounded-lg">
            <thead>
              <tr className="bg-[#B5EAD7]">
                <th className="py-2 px-4 border-b">Nickname</th>
                <th className="py-2 px-4 border-b">Balance Tokens</th>
                <th className="py-2 px-4 border-b">Inventory Items</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((user: User) => (
                <tr key={user.sub} className="hover:bg-gray-100">
                  <td className="py-2 px-4 border-b">{user.nickname}</td>
                  <td className="py-2 px-4 border-b">{user.balanceToken}</td>
                  <td className="py-2 px-4 border-b">
                    {/* Verificación para evitar TypeError */}
                    {user.inventory && user.inventory.seeds && user.inventory.waters 
                      ? user.inventory.seeds.length + user.inventory.waters.length 
                      : 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;