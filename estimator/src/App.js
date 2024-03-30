/**
 * @version 1, September 28th, 2023
 * @author Andrew Monroe 
 * @author Brady Smith
 * 
 * This file is the App.js file used by react in the index.js file.
 */

import './App.css';
import'./components/authentication/AuthContextProvider.js'
import ErrorBoundry from './components/utilComponents/ErrorBoundry.js';
import AppSwitcher from './components/AppSwitcher.js'
import React, { useState } from 'react';
import AuthContextProvider from './components/authentication/AuthContextProvider.js';
import Authenticator from './components/authentication/Authenticator.js';
import NotificationProvider from './components/utilComponents/NotificationProvider.js';
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip } from 'react-tooltip'

/**
 * Modified this App function from the default to have a header and the estimate
 * info component.
 * 
 * @returns Header with the Estimate Info component
 */
function App() {

  //Keep track of if the user is authenticated
  const [authenticated, setAuthenticated] = useState(false);
  
  return (
    <AuthContextProvider>
      <NotificationProvider>
        <Tooltip anchorSelect=".not-editable" place="left" style={{zIndex: "9999"}}>
          Cannot Edit This Field
        </Tooltip>
        <Tooltip id="menu-tooltip" style={{zIndex: "9999"}}/>
        <div className="App">
              {authenticated ? 
                (<AppSwitcher />) 
              : 
                (<Authenticator authenticate={setAuthenticated}/>)
              }
        </div>
      </NotificationProvider>
    </AuthContextProvider>
  );
}

export default App;
