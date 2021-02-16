import { createMuiTheme } from "@material-ui/core/styles";

import { lightBlue, cyan } from "@material-ui/core/colors";

export const theme = createMuiTheme({
  palette: {
    primary: {
      main: lightBlue[700],
    },
    secondary: {
      main: cyan[500],
    },
  },
});
export default theme;
