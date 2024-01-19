import { useState, createContext, useEffect } from 'react';
import Layout from '../components/Layout'
import ScheduleSection from './schedule'
import IntroSection from './introSection'
import MapSection from './mapSection';
import { TransferData, SharedDataContextType } from '../interfaces';

export const SharedDataContext = createContext<SharedDataContextType>({ 
  sharedData: { destination: "none", dates: "none", submitted: false}, 
  setSharedData: null });

const IndexPage = () => {
  const [sharedData, setSharedData] = useState<TransferData>({ destination: undefined, dates: undefined, submitted: false});
  
  const waypoints = [
    { lat: 41.895768, lng: -87.631596 }, // Starting point
    { lat: 41.879584, lng: -87.630885 }, // Waypoint 1
    { lat: 41.866450, lng: -87.619038 }, // Waypoint 2
    { lat: 41.857824, lng: -87.620345 }, // Waypoint 3
    { lat: 41.857854, lng: -87.620345 }, // Waypoint 3
    { lat: 41.850454, lng: -87.627111 }, // Destination
  ];

  return (
    <SharedDataContext.Provider value={{ sharedData, setSharedData }}>
    <Layout title="TravelEngine | Trip Planner">
        <IntroSection />
        <ScheduleSection />
        <MapSection waypoints={waypoints} />
      </Layout>
    </SharedDataContext.Provider>
  )
}

export default IndexPage
