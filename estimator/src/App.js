/**
 * @version 1, September 28th, 2023
 * @authors Andrew Monroe and Brady Smith
 * 
 * This file is the App.js file used by react in the index.js file.
 */

import './App.css';
import './components/EstimateInfo.js'
import EstimateInfo from './components/EstimateInfo.js';
import ErrorBoundry from './components/utilComponents/ErrorBoundry.js';
import React from 'react';

/**
 * Modified this App function from the default to have a header and the estimate
 * info component.
 * 
 * @returns Header with the Estimate Info component
 */
function App() {
  return (
    <div className="App">
      <div className='TitleBar'>
        <h1>Estimate Calculator</h1>
      </div>
      <ErrorBoundry fallback="A network error has occured. Please try again later.">
        <EstimateInfo />
      </ErrorBoundry>
    </div>
  );
}

export default App;
