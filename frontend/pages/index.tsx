import { useState, createContext } from 'react';
import Layout from '../components/Layout'
import ScheduleSection from './schedule'
import IntroSection from './introSection'
import { TransferData, SharedDataContextType } from '../interfaces';

export const SharedDataContext = createContext<SharedDataContextType>({ 
  sharedData: { destination: "none", dates: "none", submitted: false}, 
  setSharedData: null });

const IndexPage = () => {
  const [sharedData, setSharedData] = useState<TransferData>({ destination: undefined, dates: undefined, submitted: false});
  
  return (
    <SharedDataContext.Provider value={{ sharedData, setSharedData }}>
    <Layout title="TravelEngine | Trip Planner">
        <IntroSection />
        <ScheduleSection />
      </Layout>
    </SharedDataContext.Provider>
  )
}

export default IndexPage
