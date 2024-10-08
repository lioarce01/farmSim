import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTimeRemaining, decrementTime } from '../../redux/slices/timerSlice';
import { useGetStoreItemsQuery } from 'src/redux/api/store';
import { RootState } from 'src/redux/store/store';

const Timer = () => {
  const dispatch = useDispatch();
  const timeRemaining = useSelector(
    (state: RootState) => state.timer.timeRemaining,
  );
  const { data: storeItems, refetch: refetchStoreItems } =
    useGetStoreItemsQuery();

  useEffect(() => {
    const intervalId = setInterval(() => {
      dispatch(decrementTime());
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [dispatch]);

  useEffect(() => {
    if (timeRemaining === 0) {
      refetchStoreItems();
      dispatch(setTimeRemaining(60));
    }
  }, [timeRemaining, dispatch, refetchStoreItems]);

  return (
    <div className="flex justify-center mb-4 p-4 bg-[#79411d] rounded-lg border-4 border-[#703517] shadow-md w-auto">
      <p className="text-lg font-bold text-[#ffe6da]">
        Tiempo restante: <span className="text-[#f18d5b]">{timeRemaining}</span>{' '}
        segundos
      </p>
    </div>
  );
};

export default Timer;
