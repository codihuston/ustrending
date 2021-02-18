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
const greyscale = "Greyscale";
const spectrum = "Spectrum";

export const palettes = {
  // requirement: each entry should have 12
  Rainbow: [
    red,
    orange,
    yellow,
    green,
    teal,
    cyan,
    blue,
    indigo,
    deepPurple,
    pink,
    brown,
    grey,
  ],
  "Reverse Rainbow": [
    grey,
    brown,
    pink,
    deepPurple,
    indigo,
    blue,
    cyan,
    teal,
    green,
    yellow,
    orange,
    red,
  ],
  [greyscale]: [grey],
};

export const defaultContrast = "Very High";

export const contrasts = {
  // alternate high/lows, wider range
  "Very High": ["900", "400", "200", "100"],
  // "Very High": ["900", "100", "400", "200"],
  High: ["700", "200", "400", "300"],
  // consistently close, medium range
  Medium: ["500", "300", "400", "200"],
  // consistently closer, smaller range
  Low: ["700", "500", "400", "300"],
  "Very Low": ["900", "700", "800", "600"],
  [`${spectrum} (dark to light)`]: [
    "900",
    "800",
    "A400",
    "700",
    "A700",
    "600",
    "500",
    "A200",
    "400",
    "A100",
    "300",
    "200",
    "100",
    "50",
  ],
  [`${spectrum} (light to dark)`]: [
    "50",
    "100",
    "200",
    "300",
    "A100",
    "400",
    "A200",
    "500",
    "600",
    "A700",
    "700",
    "A400",
    "800",
    "900",
  ],
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
  paletteName: string,
  contrast: string,
  numColorsNeeded: number
) {
  let result = [];
  let selectedPalette = palettes[defaultPalette];
  let selectedContrast = contrasts[defaultContrast];
  let numVariantsToUse = 1;

  if (palettes[paletteName] && palettes[paletteName].length > 0) {
    // handle palette found
    selectedPalette = palettes[paletteName];
  }
  if (contrasts[contrast] && contrasts[contrast].length > 0) {
    selectedContrast = contrasts[contrast];
  }

  // increment numVariantsToUse * selectedPalette.length will generate enough colors
  while (selectedPalette.length * numVariantsToUse < numColorsNeeded) {
    numVariantsToUse += 1;
  }

  // generate colors from this palette
  // if using greyscale, order colors by contrast, then by colors
  if (paletteName === greyscale && contrast.match(spectrum)) {
    console.log("variant", numVariantsToUse);
    // use less variants dynamically, based on the given numColorsNeeded
    for (let i = 0; i < numVariantsToUse; i++) {
      // use final variant, if index out of bounds
      const variant = selectedContrast[i]
        ? selectedContrast[i]
        : selectedContrast[selectedContrast.length - 1];
      for (const color of selectedPalette) {
        result.push(color[variant]);
      }
    }
  }
  // if not using greyscale, order colors by colors, then by contrast
  else {
    for (const color of selectedPalette) {
      // use less variants dynamically, based on the given numColorsNeeded
      for (let i = 0; i < numVariantsToUse; i++) {
        // use final variant, if index out of bounds
        const variant = selectedContrast[i]
          ? selectedContrast[i]
          : selectedContrast[selectedContrast.length - 1];
        result.push(color[variant]);
      }
    }
  }

  return result;
}

export default theme;
