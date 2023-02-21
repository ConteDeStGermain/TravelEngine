import {useState} from "react"
import { Page1 } from "./page1"
import { Page2 } from "./page2"
import  Page3  from "./page3"
import  Page4  from "./page4"
import   Navigation   from "./navigation"
import {ChakraProvider, Box, Heading } from "@chakra-ui/react"
const Main = () => {
  const [tripType, setType] = useState("");
  const [logoColor, setLogoColor] = useState("#F5F5F5");

  return (
    <ChakraProvider>
      <Box maxWidth="1600px" margin="auto">
        <Navigation setLogoColor={setLogoColor} />
        <Heading zIndex={2} position="fixed" left="2%" top="2%" color={logoColor} fontWeight='bold' size="xl">FastTravel</Heading>
        <Page1 />
        <Page2 />
        <Page3 setType={setType} />
        <Page4 tripType={tripType} setLogoColor={setLogoColor}/>
      </Box>
    </ChakraProvider>
  )
}

export default Main;