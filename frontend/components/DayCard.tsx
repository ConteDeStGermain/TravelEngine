import React from 'react';

type Event = {
  id: number;
  time: string;
  title: string;
  description: string;
  address: string;
};

interface DayCardProps {
  dayOfWeek: string;
  events: Event[];
}

const DayCard: React.FC<DayCardProps> = ({ dayOfWeek, events }) => {
  const hoursWithEvents = events.map(event => parseInt(event.time));
  
  const totalEvents = events.length;
  const baseSize = totalEvents > 5 ? 'text-xs' : 'text-sm';
  const paddingSize = totalEvents > 5 ? 'p-1' : 'p-4';

  return (
    <div className="flex flex-col max-w-xs rounded-2xl overflow-hidden shadow-lg p-4 m-4 bg-white text-gray-800 border-gray-200 border-2">
      <h2 className="font-bold text-xl mb-4 text-gray-600 self-center">{dayOfWeek}</h2>
      <div className="overflow-y-auto">
        {hoursWithEvents.map((hour) => (
          <div key={hour} className="border-t border-gray-200 pt-2">
            <p className={`${baseSize} text-gray-700`}>{`${hour}:00`}</p>
            {events
              .filter((event) => parseInt(event.time) === hour)
              .map((event) => (
                <div key={event.id} className={`rounded-lg overflow-hidden shadow-md ${paddingSize} mt-2 bg-blue-500`}>
                  <p className={`font-bold ${baseSize} text-white`}>{event.title}</p>
                  <p className={`${baseSize} text-white mt-1`}>{event.description}</p>
                  <p className={`${baseSize} text-white italic mt-1`}>{event.address}</p>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};



export default DayCard;