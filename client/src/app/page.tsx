'use client';

import Image from 'next/image';
import Navbar from '../components/Navbar';
import bg from '../app/assets/bgstore.jpg';
import bgFeat from '../app/assets/bgfeat.jpg';
import { FaSeedling, FaSync, FaWater, FaCloud, FaStore } from 'react-icons/fa';
import { AiOutlineRight } from 'react-icons/ai';
import { useRef } from 'react';

const LandingPage = () => {
  const featuresSectionRef = useRef<HTMLElement | null>(null);

  const handleScroll = () => {
    if (featuresSectionRef.current) {
      featuresSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full bg-black">
      <Navbar />

      <div className="flex flex-col items-center justify-center h-screen relative z-10 text-center">
        <Image
          alt="Home Background"
          src={bg}
          fill
          style={{ objectFit: 'cover' }}
          className="absolute top-0 left-0 z-0 opacity-85"
        />
        <h1 className="text-6xl font-bold text-[#FDE8C9] drop-shadow-lg">
          Welcome to FarmSim
        </h1>
        <p className="mt-4 text-2xl text-[#FDE8C9] drop-shadow-lg">
          Your farming journey starts here!
        </p>
        <div className="mt-8 space-x-4">
          <button className="px-6 py-3 bg-[#8d3c19] border-r-4 border-b-4 border-[#632911] text-[#FDE8C9] font-extrabold rounded-lg shadow-lg transition duration-300 transform hover:scale-105 hover:bg-[#7c3617] hover:text-[#ffb98e]">
            Start Your Adventure
          </button>
          <button
            onClick={handleScroll}
            className="px-6 py-3 bg-[#8d3c19] border-r-4 border-b-4 border-[#632911] text-[#FDE8C9] font-extrabold rounded-lg shadow-lg transition duration-300 transform hover:scale-105 hover:bg-[#7c3617] hover:text-[#ffb98e]"
          >
            Explore Features
          </button>
        </div>
      </div>

      <section
        ref={featuresSectionRef}
        className="relative h-screen flex flex-col items-center justify-center z-10"
      >
        <Image
          alt="Features Background"
          src={bgFeat}
          fill
          style={{ objectFit: 'cover' }}
          className="absolute top-0 left-0 z-0 opacity-90"
        />
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          <div className="bg-[#e2854c] p-6 rounded-lg shadow-md shadow-black border-r-8 border-b-8 border-[#d36c31]">
            <h2 className="text-4xl font-bold text-[#333]">Features</h2>
            <ul className="mt-4 space-y-4 text-lg text-[#333]">
              <li className="flex items-center">
                <FaSeedling className="mr-2 text-xl" /> 🌱 Plant Management:
                Users can plant various seeds in designated slots.
              </li>
              <li className="flex items-center">
                <FaSync className="mr-2 text-xl" /> 🔄 Real-Time Updates:
                Reflects real-time changes in plant status.
              </li>
              <li className="flex items-center">
                <FaWater className="mr-2 text-xl" /> 💧 Watering System: Track
                the last watered status for optimal growth.
              </li>
              <li className="flex items-center">
                <FaCloud className="mr-2 text-xl" /> ☁️ Weather Tracking:
                Integrated weather monitoring for planning.
              </li>
              <li className="flex items-center">
                <FaStore className="mr-2 text-xl" /> 🛒 Store for Purchasing
                Seeds: Buy seeds from an in-app store.
              </li>
            </ul>
          </div>

          <div className="bg-[#e2854c] p-6 rounded-lg shadow-md shadow-black border-r-8 border-b-8 border-[#d36c31]">
            <h2 className="text-4xl font-bold text-[#333]">🚧 Roadmap</h2>
            <ul className="mt-4 space-y-4 text-lg text-[#333]">
              <li className="flex items-center">
                <AiOutlineRight className="mr-2 text-xl" /> 📈 Implement a
                marketplace for trading seeds.
              </li>
              <li className="flex items-center">
                <AiOutlineRight className="mr-2 text-xl" /> 🌱 Add more plant
                types with unique attributes.
              </li>
              <li className="flex items-center">
                <AiOutlineRight className="mr-2 text-xl" /> 🤝 Integrate social
                features for sharing farms with friends.
              </li>
              <li className="flex items-center">
                <AiOutlineRight className="mr-2 text-xl" /> 🎲 Develop a gacha
                system for acquiring rare seeds.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
