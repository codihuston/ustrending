/**
 * TODO:
 * 
 * 1. [] query api for latest trends
 * 2. [] connect to websocket server
 * 3. [] listen for published changes
 */
import React, {useState} from 'react';
import logo from './logo.svg';
import './App.css';
import Navigation from "./components/Navigation";

function App() {
  return (
    <div>
      {/* TODO: show top trends here. Hyperlink to google's explore page */}
      <Navigation/>
    </div>
  );
}

export default App;