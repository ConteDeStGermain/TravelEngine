import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout'
import { Event } from '../interfaces';
import Link from 'next/link';

const ScheduleSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dayData, setDayData] = useState<any>({});

  // useEffect(() => {
  //   async function fetchData() {
  //     const address = 'athens, greece'; // replace this with your actual address
  //     const res = await fetch(`/api/day_itin?address=${address}`);
  //     const data = await res.json();
  //     setDayData(data);
  //   }

  //   fetchData();
  // }, []);

  useEffect(() => {
    async function fetchData() {
      const address = 'portland maine, united states';
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const dayDataTemp = {
        'Monday': [],
        'Tuesday': [],
        'Wednesday': [],
        'Thursday': [],
        'Friday': [],
        'Saturday': [],
        'Sunday': [],
      };

      const fetchPromises = days.map(async (day, i) => {
        const offset = i * 3;
        try {
          const res = await fetch(`/api/day_itin?address=${address}&offset=${offset}`);
          const data = await res.json();
          console.log(day, data); // Debugging line
          dayDataTemp[day] = Object.values(data);
        } catch (error) {
          console.error(`Error fetching data for ${day}:`, error);
        }
      });


      await Promise.all(fetchPromises);
      setDayData(dayDataTemp);
    }

    fetchData();
  }, []);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleNext = () => {
    setCurrentIndex((currentIndex + 1) % daysOfWeek.length);
  }

  const handlePrev = () => {
    setCurrentIndex((currentIndex - 1 + daysOfWeek.length) % daysOfWeek.length);
  }

  // Create a concatenated array to simulate the sliding window behavior across the week
  const slidingDays = [...daysOfWeek, ...daysOfWeek];

  const handleDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const { source, destination } = result;

    // Clone dayData to create a new object we can manipulate
    const newDayData = { ...dayData };

    // Remove the event from the source day
    const [removed] = newDayData[source.droppableId].splice(source.index, 1);

    // Add the event to the destination day
    newDayData[destination.droppableId].splice(destination.index, 0, removed);

    // Update the state
    setDayData(newDayData);
  };

  return (
    <div className='relative w-screen h-screen'>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex bg-[#F4F7F6] flex-col items-center justify-center h-screen">
          <div className="flex flex-wrap justify-between border-[2px] rounded-[25px] p-2" style={{ width: '80vw', height: '80vh', overflow: 'auto' }}>
            {slidingDays.slice(currentIndex, currentIndex + 5).map((day, i) => (
              <Droppable droppableId={day} key={day}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="w-full sm:w-1/2 md:w-1/5 h-full bg-[#F4F7F6] overflow-auto p-2 scrollbar-hide scrollbar-width-none border-gray-300">
                    <h2 className="font-bold text-lg sticky top-[-10px] z-10 bg-[#F4F7F6]">{`${day}`}</h2>
                    <div className="pt-4">
                      {dayData[day]?.map((event: Event, index) => (
                        <Draggable key={event.id} draggableId={`${event.id}`} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-[#F4F7F6] shadow-lg rounded-lg mb-2">
                                {/* <div className="h-[150px] w-full relative"> 
                                  <Image
                                    src={event.image}
                                    alt="Picture of the author"
                                    layout="fill" // required
                                    objectFit="cover" // change to suit your needs
                                    className="rounded-t-lg z-0" // just an example
                                  />
                                </div> */}
                                <div className='p-4'>
                                  <div className="flex justify-between items-start">
                                    <h3 className="font-medium text-gray-900">{event.name}</h3>
                                  </div>
                                  <p className="text-gray-500">{`${event.rating} ⭐️`}</p>
                                  <p className="text-sm text-gray-600">{event.address}</p>
                                  <p className="text-sm text-gray-600">{event.numberofratings}</p>
                                  <Link target="_blank" className="text-sm text-gray-600 p-0" href={event.link}>Link to place</Link>
                                </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </div>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-800 mt-4">
            <button onClick={handlePrev} className="bg-gray-200 py-2 px-4 rounded-lg text-gray-800">Prev</button>
            <button onClick={handleNext} className="bg-gray-200 py-2 px-4 rounded-lg text-gray-800">Next</button>
          </div>
        </div>
      </DragDropContext>
    </div>
  )
}

export default ScheduleSection
