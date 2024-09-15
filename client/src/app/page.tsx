'use client'

import { useGetSeedsQuery } from '../services/api';
import { Seed } from '../types'; // Asegúrate de que esta ruta sea correcta

const HomePage = () => {
  const { data, error, isLoading } = useGetSeedsQuery();

  if (isLoading) return <div>Loading...</div>;

  // Verifica si el error es un objeto y maneja el tipo de error adecuadamente
  if (error) {
    const errorMessage = 'status' in error ? `Error: ${error.status} - ${error.data}` : 'Unknown Error';
    return <div>{errorMessage}</div>;
  }

  return (
    <div>
      <h1>Seeds</h1>
      <ul>
        {data?.map((seed: Seed) => (
          <li key={seed.id}>{seed.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default HomePage;