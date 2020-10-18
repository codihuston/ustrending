/**
 * TODO:
 * 
 * 1. [] query api for latest trends
 * 2. [] connect to websocket server
 * 3. [] listen for published changes
 */
import React, {useState} from 'react';
import ReactDOM from "react-dom";
import ReactTooltip from "react-tooltip";
import logo from './logo.svg';
import './App.css';
import MapChart from "./MapChart";

function App() {
  const [content, setContent] = useState("");
  return (
    <div>
      TODO: Show top trends here
      {/* TODO: show top trends here. Hyperlink to google's explore page */}
      <MapChart setTooltipContent={setContent} />
      <ReactTooltip html={true} multiline={true}>{content}</ReactTooltip>
      TODO: Show trends in order per state here
    </div>
  );
}

export default App;