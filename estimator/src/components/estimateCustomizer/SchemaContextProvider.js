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
import defaultSchema from "../JSONs/schema.json";

//Initialize the auth context
export const SchemaContext = createContext(defaultSchema);

const SchemaContextProvider = ({ children }) => {
    //state for the java web token
    const [schema, setSchema] = useState(defaultSchema);

    //return a provider for auth context wrapped around
    //any children
    return(
        <SchemaContext.Provider value={{schema, setSchema}}>
            {children}
        </SchemaContext.Provider>
    );
}

export default SchemaContextProvider;