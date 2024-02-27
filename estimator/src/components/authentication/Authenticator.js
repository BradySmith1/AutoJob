/**
 * @version 1, February 18th, 2024
 * @author Andrew Monroe 
 * @author Brady Smith
 * 
 * This file acts as a guarding component that is
 * displayed if the user is not logged in. 
 */
import "./Authenticator.css";
import axios from 'axios';
import React, { useState, useContext, useEffect } from "react";
import LogIn from "./LogIn";
import SignUp from "./SignUp";
import { AuthContext } from "./AuthContextProvider";
import { getCookie } from "../utilComponents/Functions";

function Authenticator(props){

    //Is the user logging in or signing up
    const [loggedIn, setLoggedIn] = useState(true);
    //Jwt from context
    const {jwt, setJwt} = useContext(AuthContext);
    console.log(jwt);

    //Get the refresh token
    const refresh = getCookie("AutoJobRefresh");
    console.log(refresh);

    //When the jwt changes
    useEffect(() => {
        //if the refresh token is not blank but the jwt is
        if(refresh != "" && jwt == 0){
            console.log("in here")
            //Silently log in
            axios.post('/auth/user/auth', {}, {withCredentials: true}).then((result) => {
                setJwt(result.data.jwt_token);
                props.authenticate(true);
            }).catch((error) => {
                props.authenticate(false);
                console.log(error);
            });
        } else if(jwt != 0){
            props.authenticate(true);
        }
    }, [jwt]);

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