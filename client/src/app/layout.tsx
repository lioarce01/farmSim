'use client'

import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '../redux/store/store'; // Ajusta la ruta según tu estructura de carpetas
import Navbar from 'src/components/Navbar';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import './globals.css'; // Asegúrate de que esta ruta sea correcta
import AuthWrapper from 'src/components/authWrapper';

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <Provider store={store}>
            <AuthWrapper>
              <Navbar />
              <div className='bg-[#FFF5D1] min-h-screen'>
                {children}
              </div>
            </AuthWrapper>
          </Provider>
        </UserProvider>
      </body>
    </html>
  );
};

export default RootLayout;