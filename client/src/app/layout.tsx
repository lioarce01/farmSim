'use client'

import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store/store'; // Ajusta la ruta según tu estructura de carpetas
import './globals.css'

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en">
      <body>
        <main>
          <Provider store={store}>
            {children}
          </Provider>
        </main>
      </body>
    </html>
  );
};

export default RootLayout;