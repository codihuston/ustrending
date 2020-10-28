import { createContext } from "react";

// https://mokole.com/palette.html
export const colors = {
  default: [
    "#072AC8",
    "#1E96FC",
    "#A2D6F9",
    "#FCF300",
    "#FFC600",
    "#93827F",
    "#F3F9D2",
    "#2F2F2F",
    "#EF6F6C",
    "#56E39F",
    //
    "#FCEFEF",
    "#7FD8BE",
    "#A1FCDF",
    "#FCD29F",
    "#FCAB64",
    "#0F0A0A",
    "#BDBF09",
    "#D96C06",
    "#006BA6",
    "#0496FF",
  ],
  secondary: [
    "#81F495",
    "#4D7EA8",
    "#DBD56E",
    "#66D7D1",
    "#FC7753",
    "#B6C2D9",
    "#9E90A2",
    "#828489",
    "#94ECBE",
    "#272932",
    //
    "#6699CC",
    "#FFF275",
    "#FF8C42",
    "#FF3C38",
    "#A23E48",
    "#DA627D",
    "#A53860",
    "#450920",
    "#14110F",
    "#34312D",
  ],
};

export default createContext(colors.default);
