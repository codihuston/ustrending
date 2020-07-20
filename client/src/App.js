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
      <MapChart setTooltipContent={setContent} />
      <ReactTooltip html={true}>{content}</ReactTooltip>
    </div>
  );
}

export default App;