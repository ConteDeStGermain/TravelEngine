import { useState, createContext } from 'react';
import Layout from '../components/Layout'
import ScheduleSection from './schedule'
import IntroSection from './introSection'
import { TransferData } from '../interfaces';

type SharedDataContextType = {
  sharedData: TransferData;
  setSharedData: React.Dispatch<React.SetStateAction<TransferData>>;
};

export const SharedDataContext = createContext<SharedDataContextType>(undefined);

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
