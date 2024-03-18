/**
 * @version 1, February 18th, 2024
 * @author Andrew Monroe 
 * @author Brady Smith
 * 
 * Estimate customizer, array of editeable schemas. These schemas can be selected from in
 * a drop down in the estimate calculator.
 */
import React, { useContext } from "react";
import schemaJSON from "../JSONs/schema.json";
import EstimatePreset from "./EstimatePresets";
import axios from "axios";
import defaultEstimate from "../JSONs/defaultEstimate.json";
import "./Customizer.css";
import { SchemaContext } from "./SchemaContextProvider";
import { AuthContext } from "../authentication/AuthContextProvider";

function Customizer(){
    //const [schema, setSchema] = useState(schemaJSON);
    const {schema, setSchema} = useContext(SchemaContext);

    //Pull in jwt
    const {jwt} = useContext(AuthContext);

    //Set axios auth header
    axios.defaults.headers.common = {
        "Authorization": jwt
    }

    //An object containing helper functions for the schema
    const schemaUtils = {
        /**
         * Change, or modify a schema
         * 
         * @param {Object} values, new values for the schema 
         * @param {Number} index, index of the schema to change 
         */
        change: (values, index) => {
            var newSchema = [...schema];
            var newValues = {...values};
            newSchema[index] = newValues;  
            axios.put('/api/schema/' + schema[index].estimateType, newValues).then(() => {
                setSchema(newSchema);
            });
        },
        /**
         * swap two schemas in the array
         * 
         * @param {Number} fromIndex 
         * @param {Number} toIndex 
         */
        swap: (fromIndex, toIndex) => {
            if((fromIndex >= 0 && fromIndex < schema.length) && (toIndex >= 0 && toIndex < schema.length)){
                var copySchema = [...schema];
                copySchema[fromIndex] = schema[toIndex];
                copySchema[toIndex] = schema[fromIndex];
                setSchema(copySchema);
            }
        },
        /**
         * Remove a schema from the array
         * 
         * @param {Number} index 
         */
        remove: (index) => {
            if((schema.length > 1) && (index >= 0 && index < schema.length)){
                var copySchema = [...schema];
                copySchema.splice(index, 1);
                axios.delete('/api/schema?estimateType=' + schema[index].estimateType).then((response) => {
                    console.log(response);
                    setSchema(copySchema);
                });
            }
        },
        /**
         * Add a schema to the array
         * @param {Object} element, the new schema to add 
         */
        push: (element) => {
            var copySchema = [...schema];
            copySchema.push(element);
            axios.post('/api/schema', element).then((response) => {
                console.log(response);
                setSchema(copySchema);
            });
        }
    }

    return(
        <div className="Customizer">
            <div className='TitleBar'>
                <h1>Estimate Presets</h1>
            </div>
            <div className="PresetsWrapper">
                {schema.map((estimate, index) => {
                    return(<EstimatePreset id={index + estimate.estimateType} estimate={estimate} schemaUtils={schemaUtils} index={index}/>);
                })}
                <div className="AddEstimatePreset" onClick={() => {
                    schemaUtils.push({...defaultEstimate});
                }}>
                    <div className="AddPreset"></div>
                    <h3>Add Preset</h3>
                </div>
            </div>
            <div className='TitleBar'>
                <button className="SavePresetsButton">
                    save
                </button>
            </div>
        </div>
    );
}  

export default Customizer;