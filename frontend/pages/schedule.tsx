import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useState, useEffect, useContext } from "react";
import { Event } from "../interfaces";
import Link from "next/link";
import { SharedDataContext } from ".";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  ArrowPathIcon,
  PencilSquareIcon,
} from "@heroicons/react/20/solid";

const ScheduleSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dayData, setDayData] = useState<any>({});
  const { sharedData } = useContext(SharedDataContext);
  const [editState, setEditState] = useState<boolean>(true);

  function calculateDays(data) {
    const { startDate, endDate } = data;

    // Ensure the dates are Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate the difference in milliseconds and convert to days
    const differenceInMilliseconds = end.getTime() - start.getTime();
    const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);

    return Math.round(differenceInDays);
  }

  useEffect(() => {
    async function fetchData() {
      if (sharedData.destination) {
        const address = sharedData.destination;
        const days = [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ];
        const dayDataTemp = {
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: [],
          Friday: [],
          Saturday: [],
          Sunday: [],
        };

        try {
          const fetchPromises = days.map(async (day, i) => {
            i *= 3;
            const breakfast = await fetch(
              `/api/getActivityByTypeFromCity?city=${address}&activityType=breakfast`
            );
            const breakfast_data = await breakfast.json();

            const activity = await fetch(
              `/api/getActivityByTypeFromCity?city=${address}&activityType=tourist_attraction`
            );
            const activity_data = await activity.json();

            const dinner = await fetch(
              `/api/getActivityByTypeFromCity?city=${address}&activityType=dinner`
            );
            const dinner_data = await dinner.json();

            const cocktail = await fetch(
              `/api/getActivityByTypeFromCity?city=${address}&activityType=cocktail`
            );
            const cocktail_data = await cocktail.json();

            const club = await fetch(
              `/api/getActivityByTypeFromCity?city=${address}&activityType=club`
            );
            const club_data = await club.json();

            dayDataTemp[day][0] = breakfast_data[i];
            dayDataTemp[day][1] = activity_data[i];
            dayDataTemp[day][2] = dinner_data[i];
            dayDataTemp[day][3] = activity_data[i + 1];
            dayDataTemp[day][4] = activity_data[i + 2];
            dayDataTemp[day][5] = cocktail_data[i];
            dayDataTemp[day][6] = club_data[i];
          });

          await Promise.all(fetchPromises);
          setDayData(dayDataTemp);
        } catch (e) {
          console.log(e);
        }
      }
    }

    fetchData();
  }, [sharedData.destination]);

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const handleNext = () => {
    setCurrentIndex((currentIndex + 1) % daysOfWeek.length);
  };

  const handlePrev = () => {
    setCurrentIndex((currentIndex - 1 + daysOfWeek.length) % daysOfWeek.length);
  };

  const handleEdit = () => {
    setEditState(!editState);
  };

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
    <div className="relative w-screen h-screen bg-[#F4F7F6]">
      <div className="relative ml-[10%] mb-[15px] flex justify-between items-center pt-9 pb-3 bg-[#F4F7F6] w-[80%]">
        <div>
          <button className="py-2 px-2 rounded-full bg-[#7DABB4] mr-3 drop-shadow-md">
            <ArrowPathIcon className="h-6 w-6 text-[#F4F7F6]" />
          </button>
          <button
            onClick={handleEdit}
            className="py-2 px-2 rounded-full bg-[#787C85] drop-shadow-md"
          >
            <PencilSquareIcon className="h-6 w-6 text-[#F4F7F6]" />
          </button>
        </div>
        <div className="flex">
          <button
            onClick={handlePrev}
            className="bg-[#B03C55] py-2 px-2 rounded-full drop-shadow-md mr-3"
          >
            <ChevronLeftIcon className="h-6 w-6 text-[#F4F7F6]" />
          </button>
          <button
            onClick={handleNext}
            className="bg-[#B03C55] py-2 px-2 rounded-full drop-shadow-md"
          >
            <ChevronRightIcon className="h-6 w-6 text-[#F4F7F6]" />
          </button>
        </div>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex bg-[#F4F7F6] flex-col items-center justify-center ">
          <div
            className="flex flex-wrap justify-between border-[2px] rounded-[25px] p-2"
            style={{ width: "80vw", height: "80vh", overflow: "auto" }}
          >
            {slidingDays.slice(currentIndex, currentIndex + 5).map((day, i) => (
              <Droppable droppableId={day} key={day}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="w-full sm:w-1/2 md:w-1/5 h-full bg-[#F4F7F6] overflow-auto p-2 scrollbar-hide scrollbar-width-none border-gray-300"
                  >
                    <h2 className="font-bold text-lg sticky top-[-10px] z-10 bg-[#F4F7F6]">{`${day}`}</h2>
                    <div className="pt-4">
                      {dayData[day]?.map(
                        (event: Event, index) =>
                          event && (
                            <Draggable
                              isDragDisabled={editState}
                              key={event.id}
                              draggableId={event.id + ""}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="bg-[#F4F7F6] shadow-lg rounded-lg mb-2"
                                >
                                  {/* <div className="h-[150px] w-full relative"> 
                                <Image
                                  src={event.image}
                                  alt="Picture of the author"
                                  layout="fill" // required
                                  objectFit="cover" // change to suit your needs
                                  className="rounded-t-lg z-0" // just an example
                                />
                              </div> */}
                                  <div className="p-4">
                                    <div className="flex justify-between items-start">
                                      <h3 className="font-medium text-gray-900">
                                        {event.name}
                                      </h3>
                                    </div>
                                    <p className="text-gray-500">{`${event.rating} ⭐️`}</p>
                                    <p className="text-sm text-gray-600">
                                      {event.address}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {event.numberofratings}
                                    </p>
                                    <Link
                                      target="_blank"
                                      className="flex items-center text-sm text-gray-600 p-0"
                                      href={event.link}
                                    >
                                      View on Google Maps
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-4 h-4 ml-2"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                                        />
                                      </svg>
                                    </Link>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          )
                      )}
                    </div>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
};

export default ScheduleSection;

// useEffect(() => {
//   async function fetchData() {
//     if (sharedData.destination) {
//       const address = sharedData.destination;
//       const numDays = calculateDays(sharedData.dates)

//       const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
//       const dayDataTemp = {
//         'Monday': [],
//         'Tuesday': [],
//         'Wednesday': [],
//         'Thursday': [],
//         'Friday': [],
//         'Saturday': [],
//         'Sunday': [],
//       };

//       try {
//         const res = await fetch(`/api/getActivityByTypeFromCity?city=${address}&activityType=tourist_attraction`);
//         const data = res.json();
//         console.log(data);
//       } catch (e) {
//         console.log(e);
//       }

// const fetchPromises = days.map(async (day, i) => {
//   const offset = i * 3;
//   try {
//     const res = await fetch(`/api/day_itin?address=${address}&offset=${offset}`);
//     const data = await res.json();
//     dayDataTemp[day] = Object.values(data);
//   } catch (error) {
//     console.error(`Error fetching data for ${day}:`, error);
//   }
// });

// await Promise.all(fetchPromises);
//     setDayData(dayDataTemp);
//   }
// }

//   fetchData();
// }, [sharedData.destination]);
