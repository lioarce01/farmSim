'use client';
import Navbar from '../../components/Navbar';

const HomePage = () => {
  return (
    <div className='w-full'>
      <Navbar />
      <div className='flex flex-col items-center justify-between'>
        <div className="pt-32 text-center">
          <h1 className="text-4xl font-bold text-[#A8D5BA]">Welcome to FarmSim</h1>
          <p className="mt-4 text-lg text-[#333]">
            The best app to manage your farm and maximize your crops.
          </p>
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-[#A8D5BA]">Main Features</h2>
          <ul className="mt-4 space-y-2">
            <li className="text-lg">🌱 Crop Management</li>
            <li className="text-lg">🌤️ Weather Tracking</li>
            <li className="text-lg">💧 Resource Management</li>
          </ul>
        </div>
        
        <div className="mt-10">
          <button className="px-6 py-3 bg-[#FFC1A1] text-white rounded-md hover:bg-[#FFB385] transition duration-300">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;