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
    <div className="flex justify-center mb-4">
      <p className="text-lg font-bold text-[#3e5f4c]">
        Tiempo restante: <span className="text-[#398b5a]">{timeRemaining}</span>{' '}
        segundos
      </p>
    </div>
  );
};

export default Timer;
