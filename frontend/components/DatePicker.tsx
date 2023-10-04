import React, { useState, useEffect, useRef, useContext } from 'react';
import { Transition } from '@headlessui/react'
import { SharedDataContext } from "../pages";

type DateType = {
  date: Date;
  accessible: boolean;
};

const DatePicker: React.FC = () => {
  const [dateRange, setDateRange] = useState<{ startDate: Date | null, endDate: Date | null }>({ startDate: null, endDate: null });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [calendar, setCalendar] = useState<DateType[]>([]);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [inputWidth, setInputWidth] = useState(200); // Default width
  const calendarRef = useRef<HTMLDivElement>(null);
  const { setSharedData } = useContext(SharedDataContext);

  useEffect(() => {
    if (dateRange) {
      setSharedData(prevState => ({ ...prevState, dates: dateRange }));
    }
  }, [dateRange]);
        

  useEffect(() => {
    setCalendar(generateCalendar());
  }, [currentMonth]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarVisible(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  function generateCalendar(): DateType[] {
    let dates: DateType[] = [];
    let currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    while (currentDate.getMonth() === currentMonth.getMonth()) {
      dates.push({ date: new Date(currentDate), accessible: currentDate >= new Date() });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  }

  function onDateClick(clickedDate: Date) {
    setHoveredDate(null);
    if (!dateRange.startDate || dateRange.endDate) {
      setDateRange({ startDate: clickedDate, endDate: null });
    } else if (clickedDate < dateRange.startDate) {
      setDateRange({ startDate: clickedDate, endDate: dateRange.startDate });
    } else {
      setDateRange({ startDate: dateRange.startDate, endDate: clickedDate });
    }
  }

  function nextMonth() {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }

  function prevMonth() {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }

  // Code to assign the correct prefix to numbers (1st, 2nd, 3rd, 4th etc...)
  const nth = (d: number) => {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      const startDate = dateRange.startDate;
      const endDate = dateRange.endDate;

      const startMonth = startDate.toLocaleString('default', { month: 'long' });
      const startDay = startDate.getDate();
      const endMonth = endDate.toLocaleString('default', { month: 'long' });
      const endDay = endDate.getDate();

      const text = startMonth === endMonth
        ? `${startMonth} ${startDay}${nth(startDay)} to ${endDay}${nth(endDay)}`
        : `${startMonth} ${startDay}${nth(startDay)} to ${endMonth} ${endDay}${nth(endDay)}`;

      let mulValue;
      switch (true) {
        case (startMonth === 'November' || endMonth === 'November'):
        case (startMonth === 'December' || endMonth === 'December'):
        case (startMonth === 'February' || endMonth === 'February'):
        case (startMonth === 'September' || endMonth === 'September'):
          mulValue = 11.3;
          break;
        default:
          mulValue = 10.5;
          break;
      }

      setInputWidth(Math.max(200, text.length * mulValue)); // Adjust width based on text length
    }
  }, [dateRange]);

  const dateRangeText = () => {
    if (dateRange.startDate && dateRange.endDate) {
      const startDate = dateRange.startDate;
      const endDate = dateRange.endDate;

      const startMonth = startDate.toLocaleString('default', { month: 'long' });
      const startDay = startDate.getDate();
      const endMonth = endDate.toLocaleString('default', { month: 'long' });
      const endDay = endDate.getDate();

      return startMonth === endMonth
        ? `${startMonth} ${startDay}${nth(startDay)} to ${endDay}${nth(endDay)}`
        : `${startMonth} ${startDay}${nth(startDay)} to ${endMonth} ${endDay}${nth(endDay)}`;
    }

    return '';
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="datepicker">
      <input
        type="text"
        placeholder="Dates of travel 🗓️"
        readOnly
        className="
          ml-5 mt-5 rounded-[5px] 
          placeholder:text-[#F4F7F6] bg-[#F4F7F6]/30 
          backdrop-filter backdrop-blur-lg border-none p-3 
          font-semibold leading-5 text-[#F4F7F6] text-lg  lg:text-xl 
          focus:ring-0 transition-width duration-500
          "
        value={dateRangeText()}
        style={{ width: inputWidth }} // Apply width
        onClick={() => setIsCalendarVisible(!isCalendarVisible)}
      />

      <Transition
        show={isCalendarVisible}
        enter="transition-opacity duration-75"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="w-[260px] bg-[#F4F7F6]/30 backdrop-filter backdrop-blur-lg rounded-[5px] absolute p-3 mt-3 top-1/2 left-1/2 lg:top-auto lg:left-auto lg:ml-5 transform -translate-x-1/2 -translate-y-1/2 lg:transform-none lg:translate-x-0 lg:translate-y-0" ref={calendarRef}>
          <div className='arrow-up'></div>
          <div className="flex justify-between items-center px-2 py-1">
            <button className='text-[#F4F7F6]' onClick={prevMonth}>Prev</button>
            <div className="text-center text-[#F4F7F6] w-32">
              <div>{currentMonth.toLocaleString('default', { month: 'long' })}</div>
              <div>{currentMonth.getFullYear()}</div>
            </div>
            <button className='text-[#F4F7F6]' onClick={nextMonth}>Next</button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {daysOfWeek.map((day, index) => (
              <div key={index} className="flex justify-center text-[#F4F7F6] items-center border-b border-gray-200">
                {day}
              </div>
            ))}
            {calendar.map(({ date, accessible }, i) => (
              <div
                key={i}
                className={`flex justify-center text-[#F4F7F6] items-center rounded-sm 
                ${accessible ? 'cursor-pointer' : 'text-gray-400'} 
                ${hoveredDate && date.toISOString() === hoveredDate.toISOString() ? 'bg-[#261B2C]' : ''}
                ${(dateRange.startDate && date.toISOString() === dateRange.startDate.toISOString()) ||
                    (dateRange.endDate && date.toISOString() === dateRange.endDate.toISOString()) ? 'bg-[#261B2C]' : ''}
                ${dateRange.startDate && !dateRange.endDate && hoveredDate && dateRange.startDate >= date && date >= hoveredDate ? 'bg-[#7DABB4]/50' : ''} 
                ${dateRange.startDate && dateRange.endDate && dateRange.startDate >= date && date >= dateRange.endDate ? 'bg-[#7DABB4]/50' : ''}
                ${dateRange.startDate && !dateRange.endDate && dateRange.startDate <= date && date <= (hoveredDate || dateRange.startDate) ? 'bg-[#7DABB4]/50' : ''} 
                ${dateRange.startDate && dateRange.endDate && dateRange.startDate <= date && date <= dateRange.endDate ? 'bg-[#7DABB4]' : ''}`}
                onClick={accessible ? () => onDateClick(date) : undefined}
                onMouseEnter={accessible ? () => !dateRange.endDate && setHoveredDate(date) : undefined}
              >
                {date.getDate()}
              </div>
            ))}
          </div>
        </div>
      </Transition>
    </div>
  );
};

export default DatePicker;
