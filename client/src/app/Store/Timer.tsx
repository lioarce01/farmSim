'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTimeRemaining, decrementTime } from '../../redux/slices/timerSlice';
import { useGetStoreItemsQuery } from 'src/redux/api/store';
import { RootState } from 'src/redux/store/store';
import { Card, CardContent } from '../../../components/ui/card';
import { Clock } from 'lucide-react';

export default function Timer() {
  const dispatch = useDispatch();
  const timeRemaining = useSelector(
    (state: RootState) => state.timer.timeRemaining,
  );
  const { refetch: refetchStoreItems } = useGetStoreItemsQuery();

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
    <Card className="mb-4 w-auto bg-[#1a1a25] border-[#2a2a3b] shadow-lg">
      <CardContent className="flex items-center justify-center p-4">
        <Clock className="w-5 h-5 mr-2 text-[#f18d5b]" />
        <p className="text-lg font-bold text-white">
          Time remaining:{' '}
          <span className="text-[#f18d5b]">{timeRemaining}</span> seconds
        </p>
      </CardContent>
    </Card>
  );
}
