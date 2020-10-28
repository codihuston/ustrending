/**
 * TODO:
 *
 * 1. [] query api for latest trends
 * 2. [] connect to websocket server
 * 3. [] listen for published changes
 */
import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import Navigation from "./components/Navigation";

import ColorContext, { colors } from "./context/ColorContext";
import TrendsContainer from "./containers/TrendsContainer";

function App() {
  const [colorPalatte, setColorPalatte] = useState(colors.default);

  /**
   * Used to handle color theme for the map/tables. See ColorContext.
   * @param {*} value
   */
  function handleChangeColors(value) {
    if (value && colors[value]) {
      setColorPalatte(colors[value]);
    } else {
      setColorPalatte(colors.default);
    }
  }

  return (
    <div>
      {/* TODO: show top trends here. Hyperlink to google's explore page */}
      <ColorContext.Provider value={colorPalatte}>
        <TrendsContainer>
          <Navigation handleChangeColors={handleChangeColors} />
        </TrendsContainer>
      </ColorContext.Provider>
    </div>
  );
}

export default App;
