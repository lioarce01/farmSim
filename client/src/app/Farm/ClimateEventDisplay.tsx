import React from 'react';
import { ClimateEvent } from 'src/types';
import { differenceInSeconds } from 'date-fns';
import { useSelector } from 'react-redux';
import { selectCurrentEvent } from 'src/redux/slices/climateEventSlice';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../../../components/ui/card';

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

    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0) result += `${hours}h `;
    result += `${minutes}m`;

    return result.trim();
  };

  return (
    <Card className="bg-[#1a1a25] shadow-xl rounded-lg max-w-sm max-h-sm">
      <CardHeader>
        <CardTitle className="text-white text-xl font-bold">
          {event ? 'Current Climate Event' : 'No current climate event'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {event ? (
          <div className="text-white">
            <p className="text-md">
              <strong>{event.type}</strong>
            </p>
            <p className="text-md">
              Intensity: <strong>{event.intensity}</strong>
            </p>
            <p className="text-md">
              Tiempo restante: <strong>{formatedEndDateTime()}</strong>
            </p>
          </div>
        ) : (
          <p className="text-lg text-[#c76936]">No current climate event.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ClimateEventDisplay;
