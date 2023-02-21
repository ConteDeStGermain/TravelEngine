import {
  ChakraProvider,
  Box,
  Center,
  Text,
  Heading,
  Image,
  SimpleGrid
} from "@chakra-ui/react"
import theme from './theme'
import { Element } from "react-scroll";

export const Page2 = () => (
  <ChakraProvider theme={theme}>
    <Element name="page2" height='100vh' />
      <Box height='100vh'>
        <SimpleGrid columns={2} spacing={10}>
          <Center>
            <Box height={'100%'}>
              <Image 
                src='/map.jpg'
                alt='An aesthetic picture of a map.' 
                borderRadius='20px 20px 20px 20px'
                width='400px'
                position='relative'
                top='5em'
                left='-3em'
              />
              <Image 
                src='/globe.jpg'
                alt='An aesthetic picture of a globe.' 
                borderRadius='20px 20px 20px 20px'
                width='400px'
                left='7em'
                top='-4em'
                boxShadow='dark-lg'
                position='relative'
              />
            </Box>
          </Center>
              <Box height='100%' marginRight='15%' textAlign='right'>
                <Heading color='#090909' marginTop='30%' as='h1' size='2xl'>The idea</Heading>
                <br/>
                <Text color='#090909' fontSize='2xl' lineHeight='110%'>
                  The idea of FastTravel is to algorithmically <br/>
                  generate a trip itinerary to anywhere in the world. 
                </Text>
                <br/>
                <Text color='#090909' fontSize='2xl' lineHeight='110%'>
                  This means that based only on the destination <br/>
                  and the length of your trip we would instantly <br/>
                  provide you a schedule of what to do and when <br/>
                  to do it, thus saving you the worry of not making <br/>
                  the most out of your experience abroad.
                </Text>
              </Box>
        </SimpleGrid>
       </Box>
  </ChakraProvider>
)
