'use client'

const HomePage = () => {
  return (
    <div className='w-full bg-[#FFF5D1] min-h-screen flex flex-col items-center'>
      <div className="pt-32">
        <h1 className="text-4xl font-bold text-[#A8D5BA] text-center">GAME NAME</h1>
      </div>
      <div className="bg-[#A8D5BA] rounded-md p-4 flex flex-col md:flex-row items-center justify-center mt-20 w-11/12 md:w-1/2 lg:w-1/3 shadow-lg">
        <div className="p-2">
          {/* Aquí puedes añadir tu imagen */}
          <img src="/path/to/image.png" alt="Imagen descriptiva" className="rounded-md w-full h-auto max-w-xs" />
        </div>
        <div className="p-2 text-[#333] text-center md:text-left">
          <h3 className="text-lg font-semibold">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Laboriosam necessitatibus consectetur praesentium ipsa porro iure, odit voluptas, ea magnam neque a sunt ullam quidem corporis placeat optio debitis laborum iusto!</h3>
          <button className="mt-4 px-4 py-2 bg-[#FFC1A1] text-white rounded-md hover:bg-[#FFB385] transition duration-300">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;