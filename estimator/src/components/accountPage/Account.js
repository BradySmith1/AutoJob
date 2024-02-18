import React, { useContext } from "react"
import { AuthContext } from "../authentication/AuthContextProvider"
import "./Account.css"

function Account(){
    const {jwt, setJwt} = useContext(AuthContext);

    return(
        <div className="AccountWrapper">
            <button className="button" onClick={() => {
                setJwt(0);
                document.cookie = "AutoJobRefresh=;expires=" + new Date(0).toUTCString();
                window.location.reload(true);
            }}>
                Log Out
            </button>
            
        </div>
    );
}  

export default Account;