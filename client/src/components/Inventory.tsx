import React from 'react';
import { FaTimes } from 'react-icons/fa';
import useFetchUser from 'src/hooks/useFetchUser';

interface InventoryPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const InventoryList: React.FC<{ items: any[]; title: string; }> = ({ items, title }) => {
  return (
    <>
      <h3 className="text-md font-semibold text-[#172c1f]">{title}</h3>
      {items.length > 0 ? (
        <ul className="mb-4">
          {items.map((item, index) => (
            <li key={index} className="text-[#172c1f] mb-2">
              {item.name} - Quantity: {item.quantity}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[#172c1f] mb-4">No {title.toLowerCase()} available.</p>
      )}
    </>
  );
};

const InventoryPopup: React.FC<InventoryPopupProps> = ({ isOpen, onClose }) => {
  const { user: fetchedUser, error, isLoading } = useFetchUser();

  if (isLoading) return (
      <span className="text-[#A8D5BA] font-semibold">Loading inventory...</span>
  );  

  if (error) return <div className="text-red-500">{`Error: ${error}`}</div>;

  if (!fetchedUser || !fetchedUser.inventory) {
    return <div className="text-red-500">Inventory not available.</div>;
  }

  const { seeds = [], waters = [] } = fetchedUser.inventory; // Usar valores predeterminados para evitar errores

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-[#FFF5D1] p-6 rounded-lg shadow-lg w-96 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-[#FFB385] hover:text-red-500 transition duration-300"
        >
          <FaTimes size={20} />
        </button>
        <h2 className="text-lg font-semibold mb-4 text-[#172c1f]">Inventory</h2>
        
        {/* Mostrar las semillas y aguas usando el componente InventoryList */}
        <InventoryList items={seeds} title="Seeds" />
        <InventoryList items={waters} title="Waters" />
      </div>
    </div>
  );
};

export default InventoryPopup;
