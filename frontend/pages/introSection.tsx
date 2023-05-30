import Image from "next/image"
import EuroCity from "../public/intro_image.jpg"

const IntroSection = () => {

  return (
   <div className="relative w-screen h-screen">
      <div className="absolute inset-x-0 top-[18%] z-10 flex flex-col justify-center items-center">
        <h1 className="text-9xl font-bold text-[#F4F7F6]">TravelEngine</h1>
        <h3 className="text-6xl font-light text-[#F4F7F6]">An itinerary for every destination</h3>
      </div>
      <Image 
        alt="Beautiful landscape of a European city" 
        src={EuroCity}
        className="z-0"
      />
    </div>
  )
}

export default IntroSection;