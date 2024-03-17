/**
 * @version 1, February 18th, 2024
 * @author Andrew Monroe 
 * @author Brady Smith
 * 
 * This file is the provider for the auth context,
 * which consists of the jwt value and the function to
 * set the jwt value
 */
import React, { useState, createContext } from 'react'

//Initialize the auth context
export const AuthContext = createContext({
    jwt: "0",
    setJwt: () => {},
    user: {},
    setUser: () => {}
});

const AuthContextProvider = ({ children }) => {
    //state for the java web token
    const [jwt, setJwt] = useState("0");
    const [user, setUser] = useState({});

    //return a provider for auth context wrapped around
    //any children
    return(
        <AuthContext.Provider value={{jwt, setJwt, user, setUser}}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContextProvider;