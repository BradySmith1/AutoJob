import React, { useState, createContext } from 'react'

export const AuthContext = createContext({
    jwt: "0",
    setJwt: () => {}
});

const AuthContextProvider = ({ children }) => {
    const [jwt, setJwt] = useState("0");

    return(
        <AuthContext.Provider value={{jwt, setJwt}}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContextProvider;