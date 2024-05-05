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

import React, { useContext, useState } from "react"
import { AuthContext } from "../authentication/AuthContextProvider"
import copy from "../../assets/copy_white.png"
import "./Account.css"

/**
 * This function is the account page which lets the 
 * user log out and tells the user the url of the
 * customer estimate form.
 * 
 * @returns {JSXElement} Account
 */
function Account(){
    //Context used to set the jwt token
    const {jwt, setJwt, user} = useContext(AuthContext);
    //State to keep track of if the link has been copied
    const [copied, setCopied] = useState(false);

    return(
        <div className="AccountWrapper">
            <div className='TitleBar'>
                <h1>Account</h1>
            </div>
            <div className="LinkContainer">
                <h3 style={{marginBottom: "5px", marginLeft: "5px"}}>Esimate Form Link:</h3>
                <div className="LinkWrapper">
                    <div className="Link">
                        localhost:3000/{user.id}
                    </div>
                    <a
                            data-tooltip-id="menu-tooltip"
                            data-tooltip-content={copied ? "Copied" : "Copy to Clipboard"}
                            data-tooltip-place="bottom"
                            className="Tooltip"
                            onMouseLeave={() => {setCopied(false)}}
                    >
                    {/*Copy button*/}
                    <div className="Copy" onClick={() => {
                        setCopied(true);
                        navigator.clipboard.writeText(`localhost:3000/${user.id}`);
                    }}>
                        <img className="copyImg" src={copy} />
                    </div>
                    </a>
                </div>
            </div>
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