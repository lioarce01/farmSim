'use client'

import Link from 'next/link';

const LandingPage = () => {
  return (
    <div className="w-full bg-[#FFF5D1] min-h-screen flex flex-col items-center justify-center">
      <div className="text-center">
        {/* Título principal */}
        <h1 className="text-6xl font-bold text-[#A8D5BA] mb-8">Welcome to FarmSim</h1>
        
        {/* Descripción */}
        <p className="text-xl text-[#333] mb-8 max-w-xl">
          Immerse yourself in the world of farming simulations. Enjoy the experience of managing your own farm, cultivating crops, raising animals, and trading goods!
        </p>

        {/* Botón para iniciar */}
        <Link href="/Home">
          <button className="px-8 py-3 bg-[#FFC1A1] text-white font-semibold text-lg rounded-lg shadow-lg hover:bg-[#FFB385] transition duration-300">
            Get Started
          </button>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;