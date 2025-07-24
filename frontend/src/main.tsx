import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import {ThemeProvider} from "./themes/ThemeProvider";
import CssBaseline from "@mui/material/CssBaseline";


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
      <ThemeProvider>
          <App />
      </ThemeProvider>
);
