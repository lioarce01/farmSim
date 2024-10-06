const LoadingSpinner = () => (
  <div className="flex items-center">
    <div className="animate-spin border-4 border-t-transparent border-[#A8D5BA] rounded-full h-8 w-8"></div>
    <span className="ml-2 text-[#172c1f] font-semibold">Loading...</span>
  </div>
);
export default LoadingSpinner;
