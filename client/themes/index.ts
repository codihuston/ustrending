import { createMuiTheme } from "@material-ui/core/styles";

import {
  amber,
  blue,
  blueGrey,
  brown,
  cyan,
  deepOrange,
  deepPurple,
  green,
  grey,
  indigo,
  lightBlue,
  lightGreen,
  lime,
  orange,
  pink,
  purple,
  red,
  teal,
  yellow,
} from "@material-ui/core/colors";

export const palettes = {
  0: [red, deepPurple, lightBlue],
  1: [pink, indigo, cyan],
  2: [purple, blue, teal],
  3: [green, yellow, deepOrange],
  4: [lightGreen, amber, brown],
  5: [lime, orange, grey, blueGrey],
  reds: [red, pink, purple],
  violets: [deepPurple, indigo, blue],
  blues: [lightBlue, cyan, teal],
  greens: [green, lightGreen, lime],
  yellows: [yellow, amber, orange, deepOrange],
  darks: [brown, grey, blueGrey],
};

export const contrasts = {
  high: ["A100", "A200", "A400", "A700"],
  medium: ["900", "600", "300", "100"],
  low: ["900", "800", "700", "600"],
};

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

export function getColors(
  paletteName: number | string,
  contrast: number | string
) {
  let result = [];
  const defaultPalette = 0;
  const defaultContrast = "high";
  let selectedPalette = palettes[defaultPalette];
  let selectedContrast = contrasts[defaultContrast];

  if (palettes[paletteName] && palettes[paletteName].length > 0) {
    // handle palette found
    selectedPalette = palettes[paletteName];
  }
  if (contrasts[contrast] && contrasts[contrast].length > 0) {
    selectedContrast = contrasts[contrast];
  }

  // generate colors from this palette
  for (const color of selectedPalette) {
    for (const variant of selectedContrast) {
      result.push(color[variant]);
    }
  }

  return result;
}

export default theme;
