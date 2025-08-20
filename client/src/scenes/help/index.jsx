import React from 'react';
import WidgetWrapper from "../../components/WidgetWrapper";
import Navbar from "../navbar";
import {
    Box,
    useMediaQuery,
  } from "@mui/material";
import PDF from "../../components/PDF"

function Help() {
    const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  return (
    <div>
          <Navbar />
          <Box
            width="100%"
            padding="2rem 6%"
            display={isNonMobileScreens ? "flex" : "block"}
            gap="2rem"
            justifyContent="center"
          >
              <WidgetWrapper 
                justifyContent="center"
                flexBasis={isNonMobileScreens ? "85%" : "100%"}
              >
                  <PDF document ="./slides.pdf" />
              </WidgetWrapper>
          </Box>
    </div>
  )
}

export default Help;