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
      <MapChart setTooltipContent={setContent} />
      <ReactTooltip html={true}v multiline={true}>{content}</ReactTooltip>
      TODO: Show trends in order per state here
    </div>
  );
}

export default App;