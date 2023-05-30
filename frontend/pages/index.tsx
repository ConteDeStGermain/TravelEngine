import Layout from '../components/Layout'
import ScheduleSection from './schedule'
import IntroSection from './introSection'

const IndexPage = () => {
  return (
    <Layout title="TravelEngine | Trip Planner">
      <IntroSection />
      <ScheduleSection />
    </Layout>
  )
}

export default IndexPage
