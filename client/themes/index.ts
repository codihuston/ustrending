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

export const defaultPalette = "Rainbow";

export const palettes = {
  // "Red to Blue": [red, pink, purple, deepPurple, lightBlue, blue],
  "Rainbow": [red, deepOrange, orange, yellow, lightGreen, green, teal, cyan, blue, indigo, purple, pink],
  "Reverse Rainbow": [pink, purple, indigo, blue, cyan, teal, green, lightGreen, yellow, orange, deepOrange, red]
  // "Red to Green": [pink, indigo, cyan],
  // "Purple to Blue": [purple, blue, teal],
  // "Green to Orange": [green, yellow, deepOrange],
  // "Green to Brown": [lightGreen, amber, brown],
  // "Yellow to Grey": [lime, orange, grey, blueGrey],
  // Reds: [red, pink, purple],
  // Violets: [deepPurple, indigo, blue],
  // Blues: [lightBlue, cyan, teal],
  // Greens: [green, lightGreen, lime],
  // Yellows: [yellow, amber, orange, deepOrange],
  // Darks: [brown, grey, blueGrey],
};

export const defaultContrast = "Very Dark";

export const contrasts = {
  "Very Dark": ["900", "800", "700", "600"],
  Dark: ["700", "500", "300", "100"],
  Medium: ["A200", "300", "500", "900"],
  Light: ["A100", "A200", "A400", "A700"],
  "Very Light": ["50", "100", "200", "300"],
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
