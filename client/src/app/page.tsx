'use client'

const HomePage = () => {

      

  return (
    <div className='w-full'>
      <div className='flex flex-col items-center justify-between'>
        <div className="pt-32">
          <h1>GAME NAME</h1>
        </div>
        <div className="bg-[#A8D5BA] rounded-md p-4 flex items-center justify-center mt-20 w-1/3">
          <div className="p-2">
            <h2>imagen</h2>
          </div>
          <div className="p-2">
            <h3>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Laboriosam necessitatibus consectetur praesentium ipsa porro iure, odit voluptas, ea magnam neque a sunt ullam quidem corporis placeat optio debitis laborum iusto!</h3>
            <button>get started</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;