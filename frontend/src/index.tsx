import { ColorModeScript } from "@chakra-ui/react"
import * as React from "react"
import * as ReactDOM from "react-dom/client"
import { Box } from "@chakra-ui/react"
import Main from "./main"

const container = document.getElementById("root")
const root = ReactDOM.createRoot(container!)

root.render(
  <React.StrictMode>
    <ColorModeScript />
    <Main />
  </React.StrictMode>,
)