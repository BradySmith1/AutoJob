/**
 * @version 1, February 18th, 2024
 * @author Andrew Monroe 
 * @author Brady Smith
 * 
 * This file is a simple account component that currently
 * only consists of a log out button. In the future this page
 * could display account information and potnetially allow
 * the user to change their email or password.
 */

import React, { useContext } from "react"
import { AuthContext } from "../authentication/AuthContextProvider"
import "./Account.css"

function Account(){
    //Context used to set the jwt token
    const {jwt, setJwt} = useContext(AuthContext);

    return(
        <div className="AccountWrapper">
            <button className="button" onClick={() => {
                //reset the jwt
                setJwt(0);
                //reset the refresh token
                document.cookie = "AutoJobRefresh=;expires=" + new Date(0).toUTCString();
                //Refresh the page
                window.location.reload(true);
            }}>
                Log Out
            </button>
            
        </div>
    );
}  

export default Account;