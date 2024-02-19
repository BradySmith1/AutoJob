import "./Authenticator.css";
import axios from 'axios';
import React, { useState } from "react";
import LogIn from "./LogIn";
import SignUp from "./SignUp";

function Authenticator(props){

    const [loggedIn, setLoggedIn] = useState(true);

    const authInstance = axios.create({
        baseURL: "https://localhost:5000",
        headers: {
            credentials: false,
            "Access-Control-Allow-Origin": "*"
        }
    });

    return(
        <div className="AuthWrapper">
            {loggedIn ? 
                (<LogIn 
                    authenticate={props.authenticate}
                    setLoggedIn={setLoggedIn}
                    instance={authInstance}
                />) 
            : 
                (<SignUp 
                    setLoggedIn={setLoggedIn}
                    instance={authInstance}
                />)
            }
        </div>
    );
}

export default Authenticator;