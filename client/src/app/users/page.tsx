'use client'

import { useGetUsersQuery } from '../../services/api';
import { User } from '../../types'; // Asegúrate de que esta ruta sea correcta

const UsersPage = () => {
  const { data, error, isLoading } = useGetUsersQuery();

  if (isLoading) return <div>Loading...</div>;

  // Verifica si el error es un objeto y maneja el tipo de error adecuadamente
  if (error) {
    const errorMessage = 'status' in error ? `Error: ${error.status} - ${error.data}` : 'Unknown Error';
    return <div>{errorMessage}</div>;
  }

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {data?.map((user: User) => (
          <li key={user.id}>{user.username}</li>
        ))}
      </ul>
    </div>
  );
};

export default UsersPage;