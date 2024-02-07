/**
 * @version 1, September 28th, 2023
 * @author Andrew Monroe 
 * @author Brady Smith
 * 
 * This file is the App.js file used by react in the index.js file.
 */

import './App.css';
import './components/EstimateInfo.js'
import EstimateInfo from './components/EstimateInfo.js';
import ErrorBoundry from './components/utilComponents/ErrorBoundry.js';
import Authenticator from './components/authentication/Authenticator.js';
import React, { useState } from 'react';

/**
 * Modified this App function from the default to have a header and the estimate
 * info component.
 * 
 * @returns Header with the Estimate Info component
 */
function App() {

  const [authenticated, setAuthenticated] = useState(false);
  
  return (
    <div className="App">
      <ErrorBoundry fallback="A network error has occured. Please try again later.">
        {authenticated ? 
          (<EstimateInfo />) 
        : 
          (<Authenticator authenticate={setAuthenticated}/>)
        }
      </ErrorBoundry>
    </div>
  );
}

export default App;
