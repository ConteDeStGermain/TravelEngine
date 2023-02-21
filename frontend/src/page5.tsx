import * as React from "react"
import {
  ChakraProvider,
  Box,
  Center,
  Text,
  Heading,
} from "@chakra-ui/react"
import theme from './theme'

export const Page5 = (prop: {displayStatus: boolean}) => (
  <ChakraProvider theme={theme}>
    <Box 
      height="100vh" 
      width="100vw" 
      backgroundImage="./plane.jpg" 
      backgroundPosition="50% 60%"
      backgroundSize="100%"
      position="fixed"
      top="0"
      className="largerThenParent"
      zIndex="1"
      display={prop.displayStatus ? "block" : "none"}
    >
      <Box textAlign="center">
        <Heading marginTop="26%" color='#F5F5F5'  size="2xl">Thank you for participating, now what?</Heading><br/>
        <Text lineHeight="110%" color='#F5F5F5' fontSize="2xl" fontWeight="medium">
          Now that you've submitted your travel details, go ahead and pack your bags! <br/>
          As this is a manual process for now, we will get back to you within 4 days with an itinerary we think you'll like.
        </Text> 
      </Box>
    </Box>
  </ChakraProvider>
)
