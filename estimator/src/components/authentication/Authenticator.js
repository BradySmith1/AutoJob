import "./Authenticator.css";
import axios from 'axios';
import React, { useState } from "react";
import LogIn from "./LogIn";
import SignUp from "./SignUp";
import { AuthContext } from "../../App";

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