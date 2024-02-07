import "./Authenticator.css";
import axios from 'axios';
import React, { useEffect, useState } from "react";
import LogIn from "./LogIn";
import SignUp from "./SignUp";

function Authenticator(props){

    const [loggedIn, setLoggedIn] = useState(true);

    return(
        <div className="AuthWrapper">
            {loggedIn ? 
                (<LogIn 
                    authenticate={props.authenticate}
                    setLoggedIn={setLoggedIn}
                />) 
            : 
                (<SignUp 
                    setLoggedIn={setLoggedIn}
                />)
            }
        </div>
    );
}

export default Authenticator;