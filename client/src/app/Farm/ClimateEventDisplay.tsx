import React from 'react';
import { ClimateEvent } from 'src/types';
import { differenceInSeconds } from 'date-fns';
import { useSelector } from 'react-redux';
import { selectCurrentEvent } from 'src/redux/slices/climateEventSlice';

interface ClimateEventDisplayProps {
  event?: ClimateEvent | null;
}

const ClimateEventDisplay: React.FC<ClimateEventDisplayProps> = ({ event }) => {
  const currentEvent = useSelector(selectCurrentEvent);

  const currentEventEndTime = currentEvent?.endTime;
  const formatedEndDateTime = () => {
    const now = new Date();
    const end = new Date(currentEventEndTime ?? now);
    const diffInSeconds = differenceInSeconds(end, now);

    if (diffInSeconds <= 0) {
      return 'Evento finalizado';
    }

    const days = Math.floor(diffInSeconds / (24 * 60 * 60));
    const hours = Math.floor((diffInSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((diffInSeconds % (60 * 60)) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className="bg-[#f8d7c6] bg-opacity-90 border-4 border-[#703517] rounded-lg shadow-lg p-6 text-center text-[#4d2612]">
      {event ? (
        <>
          <h2 className="text-2xl font-extrabold mb-4 text-[#c76936]">
            Current Climate Event
          </h2>
          <p className="text-lg font-semibold">
            <strong>{event.type}</strong>
          </p>
          <p className="text-lg font-semibold">
            Intensity: <strong>{event.intensity}</strong>
          </p>
          <p className="text-lg font-semibold">
            Time Remaining: {formatedEndDateTime()}
          </p>
        </>
      ) : (
        <p className="text-lg font-semibold text-[#c76936]">
          No current climate event.
        </p>
      )}
    </div>
  );
};

export default ClimateEventDisplay;
