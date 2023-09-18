import Image from "next/image";
import EuroCity from "../public/intro_image.jpg";
import { Fragment, useContext, useEffect, useState } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import DatePicker from "../components/DatePicker";
import { SharedDataContext } from ".";

type cityWithId = {
  id: number,
  name: string
}

const IntroSection = () => {
  const [cities, setCities] = useState([]);
  const [selected, setSelected] = useState(cities[0]);
  const [query, setQuery] = useState("");
  const { setSharedData } = useContext(SharedDataContext);

  useEffect(() => {
    async function fetchCities() {
      try {
        const res = await fetch("/api/getAvailableCities");
        let data = await res.json();
        

        let citiesWithIds = data.map((city, index) => ({
          id: index + 1,
          name: city,
        }));

        setCities(citiesWithIds);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    }

    fetchCities();
  }, []);

  const filteredCities =
    query === ""
      ? cities
      : cities.filter((city) =>
          city.name
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        );

  useEffect(() => {
    if (selected) {
      setSharedData(prevState => ({ ...prevState, destination: selected.name }));
    }
  }, [selected]);
        
  return (
    <div className="relative w-screen h-screen">
      <div className="absolute inset-x-0 top-[18%] z-10 flex flex-col justify-center items-center">
        <h1 className="text-9xl font-bold text-[#F4F7F6]">TravelEngine</h1>
        <h3 className="text-6xl font-light text-[#F4F7F6]">
          An itinerary for every destination
        </h3>
        <div className="flex items-center">
          {/* <label htmlFor="destination" className="mr-3 text-2xl font-light text-[#F4F7F6]">Destination:</label> */}
          <Combobox value={selected} onChange={setSelected}>
            <div className="relative mt-5">
              <div className="relative w-full cursor-default overflow-hidden rounded-lg  text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                <Combobox.Input
                  className="w-[325px] rounded-[5px] placeholder:text-[#F4F7F6] bg-[#F4F7F6]/30 backdrop-filter backdrop-blur-md border-none p-3 font-semibold leading-5 text-[#F4F7F6] text-xl focus:ring-0"
                  displayValue={(city: cityWithId) => city.name}
                  placeholder="Enter your next destination ✈️"
                  onChange={(event) => setQuery(event.target.value)}
                />
                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-[#F4F7F6]"
                    aria-hidden="true"
                  />
                </Combobox.Button>
              </div>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                afterLeave={() => setQuery("")}
              >
                <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-[#F4F7F6]/30 backdrop-filter backdrop-blur-md py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {filteredCities.length === 0 && query !== "" ? (
                    <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                      Generate missing place!
                    </div>
                  ) : (
                    filteredCities.map((city) => (
                      <Combobox.Option
                        key={city.id}
                        className={({ active }) =>
                          `relative text-lg cursor-default select-none py-2 pl-10 pr-4 ${
                            active
                              ? "bg-[#7DABB4] text-[#F4F7F6]"
                              : "text-[#261B2C]"
                          }`
                        }
                        value={city}
                      >
                        {({ selected, active }) => (
                          <>
                            <span
                              className={`block truncate ${
                                selected ? "font-medium" : "font-normal"
                              }`}
                            >
                              {city.name}
                            </span>
                            {selected ? (
                              <span
                                className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                  active ? "text-[#F4F7F6]" : "text-[#261B2C]"
                                }`}
                              >
                                <CheckIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Combobox.Option>
                    ))
                  )}
                </Combobox.Options>
              </Transition>
            </div>
          </Combobox>
          <DatePicker />
        </div>
        <button
          onClick={() => setSharedData(prevState => ({ ...prevState, submitted: true }))}
          className="
            bg-[#7DABB4]/75 backdrop-filter backdrop-blur-sm border-none 
            p-2 text-lg font-bold mt-5 rounded-md text-[#F4F7F6] z-[-10]
            transition-colors duration-300 ease-in-out 
            hover:bg-[#7DABB4] 
          "
        >
          Generate
        </button>
      </div>
      <Image
        alt="Beautiful landscape of a European city"
        src={EuroCity}
        className="z-0"
      />
    </div>
  );
};

export default IntroSection;


function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}