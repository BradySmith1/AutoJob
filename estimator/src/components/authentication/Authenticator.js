import "./Authenticator.css";
import axios from 'axios';
import React, { useState, useContext, useEffect } from "react";
import LogIn from "./LogIn";
import SignUp from "./SignUp";
import { AuthContext } from "./AuthContextProvider";
import { getCookie } from "../utilComponents/Functions";

function Authenticator(props){

    const [loggedIn, setLoggedIn] = useState(true);
    const {jwt, setJwt} = useContext(AuthContext);
    console.log(jwt);

    const refresh = getCookie("AutoJobRefresh");
    console.log(refresh);

    useEffect(() => {
        if(refresh != "" && jwt == 0){
            console.log("in here")
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