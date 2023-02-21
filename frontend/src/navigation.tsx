import {useState} from 'react';
import { animateScroll as scroll, scroller } from "react-scroll";
import {
  ChakraProvider,
  Box,
  Button
} from "@chakra-ui/react"
import theme from './theme'
import React from "react";
const Navigation = (prop: {setLogoColor: React.Dispatch<React.SetStateAction<any>>}) => {
  const [page, setPage] = useState(1);
  const [buttonState, setButtonState] = useState(false);

  const handleButtonPress = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const target = e.target as HTMLTextAreaElement;
    let goToPage;

    setButtonState(true);
    setTimeout(() => setButtonState(false), 750);
    if (target.id === "down") {
      goToPage = "page" + (page + 1);
      scroller.scrollTo(goToPage , {duration: 750, delay: 0, smooth: true, offset: visualViewport.width > 1440 ?  -150 : -50 });
      if (page !== 4) {
        setPage(page + 1)
      }
    } else {
      goToPage = "page" + (page - 1);
      scroller.scrollTo(goToPage , {duration: 750, delay: 0, smooth: true, offset: visualViewport.width > 1440 ?  -150 : -50 });
      if (page !== 1) {
        setPage(page - 1)
      }
    }

    if (goToPage === "page2") {
      prop.setLogoColor("#090909");
    } 

    if (goToPage === "page1") {
      prop.setLogoColor("#F5F5F5");
    }
  }

  return (
    <ChakraProvider theme={theme}>
      <Box borderRadius="50%" zIndex="1"  position="fixed" bottom="50%" right="0%" transform="rotate(270deg)">
        <Button disabled={buttonState} id='down' onClick={(e) => handleButtonPress(e)} variant='ghost' size="lg">{"<"}</Button>
        <Button disabled={buttonState} onClick={(e) => handleButtonPress(e)} variant='ghost' size="lg">{">"}</Button>
      </Box>
    </ChakraProvider>
  )
}

export default Navigation;