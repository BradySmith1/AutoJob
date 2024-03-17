/**
 * @version 1, February 18th, 2024
 * @author Andrew Monroe 
 * @author Brady Smith
 * 
 * This file is the provider for the auth context,
 * which consists of the jwt value and the function to
 * set the jwt value
 */
import React, { useState, createContext, useMemo, useContext } from 'react'
import axios from 'axios';
import defaultSchema from "../JSONs/schema.json";
import { AuthContext } from '../authentication/AuthContextProvider';

//Initialize the auth context
export const SchemaContext = createContext(defaultSchema);

const SchemaContextProvider = ({ children }) => {

    const {jwt} = useContext(AuthContext);

    axios.defaults.headers.common = {
        "Authorization": jwt
    }

    const [schema, setSchema] = useState(defaultSchema);

    const [loading, setLoading] = useState(true);

    useMemo(() => {
        axios.get('/api/schemas').then((response) => {
            console.log(response.data)
            setSchema(response.data);
            setLoading(false);
        });
    }, []);

    //state for the java web toke

    //return a provider for auth context wrapped around
    //any children
    return(
        <SchemaContext.Provider value={{schema, setSchema}}>
            {loading ? (
                <h2>Loading...</h2>
            ) : (
                children
            )}
        </SchemaContext.Provider>
    );
}

export default SchemaContextProvider;