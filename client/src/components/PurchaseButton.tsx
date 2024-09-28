import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useGetStoreBuyMutation } from '../redux/api/store'; // Ajusta la ruta según tu estructura
import { ItemType, PurchaseButtonProps } from 'src/types';
import { useGetUserBySubQuery } from 'src/redux/api/users';

const PurchaseButton: React.FC<PurchaseButtonProps> = ({ userSub, itemId, quantity, itemType: propItemType, stock, refetchStoreItems }) => {
  const [buyItem, { isLoading, error }] = useGetStoreBuyMutation();
  const { data: user, refetch } = useGetUserBySubQuery(userSub)
  const [purchaseQuantity, setPurchaseQuantity] = useState<number>(quantity || 1); // Cantidad a comprar
  const derivedItemType: ItemType = purchaseQuantity > 0 ? ItemType.seed : ItemType.water

  const handleBuy = async () => {
    try {
      const response = await buyItem({
        userSub,
        itemId,
        quantity: purchaseQuantity,
        itemType: propItemType || derivedItemType,
      }).unwrap();
      refetch()
      refetchStoreItems()
      console.log('Compra exitosa', response);
    } catch (err) {
      console.error('Error al realizar la compra', err);
    }
  };

  return (
    <button
      onClick={handleBuy}
      disabled={isLoading || stock <= 0}
      className={`mt-4 px-4 py-2 rounded-lg font-semibold transition-colors duration-300 ${
        isLoading || stock <= 0
          ? 'bg-gray-300 text-gray-600 cursor-not-allowed' // Estilo cuando está deshabilitado
          : 'bg-[#398b5a] text-white hover:bg-[#276844]' // Estilo cuando está habilitado
      }`}
    >
      {stock <= 0 ? 'No stock' : 'Comprar'}
    </button>
  );
};

export default PurchaseButton;