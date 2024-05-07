/**
 * @version 1, February 18th, 2024
 * @author Andrew Monroe
 * @author Brady Smith
 *
 * This file is the provider for the schema context,
 * which consists of the schema and a function to set the schema
 */
import React, { useState, createContext, useMemo, useContext } from "react";
import axios from "axios";
import defaultSchema from "../JSONs/schema.json";
import { AuthContext } from "../authentication/AuthContextProvider";

//Initialize the auth context
export const SchemaContext = createContext(defaultSchema);

/**
 * This method provides the schema context to it's
 * children components
 *
 * @param {JSXElement} children
 * @returns {JSXElement} schemaContextProvider
 */
const SchemaContextProvider = ({ children }) => {
  //Pull in JWT
  const { jwt } = useContext(AuthContext);

  //JWT header
  axios.defaults.headers.common = {
    Authorization: jwt,
  };

  //Schema state
  const [schema, setSchema] = useState(defaultSchema);

  //Loading message
  const [loading, setLoading] = useState(true);

  //Get the schemas from the database
  useMemo(() => {
    axios.get("/api/schemas").then((response) => {
      console.log(response.data);
      setSchema(response.data);
      setLoading(false);
    });
  }, []);

  //return a provider for auth context wrapped around
  //any children
  return (
    <SchemaContext.Provider value={{ schema, setSchema }}>
      {loading ? <h2>Loading...</h2> : children}
    </SchemaContext.Provider>
  );
};

export default SchemaContextProvider;
