import React from "react";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { theme } from "../themes";
import { Navigation } from "./Navigation";

export function Layout(props) {
  return (
    <MuiThemeProvider theme={theme}>
      <Navigation />
      {props.children}
    </MuiThemeProvider>
  );
}
