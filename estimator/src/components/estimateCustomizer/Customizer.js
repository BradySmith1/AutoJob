/**
 * @version 1, February 18th, 2024
 * @author Andrew Monroe 
 * @author Brady Smith
 * 
 * This file will be the estimate customizer.
 */
import React, { useState } from "react";
import schemaJSON from "../JSONs/schema.json";
import EstimatePreset from "./EstimatePresets";
import defaultEstimate from "../JSONs/defaultEstimate.json";
import "./Customizer.css";

function Customizer(){
    const [schema, setSchema] = useState(schemaJSON);

    const schemaUtils = {
        change: (values, index) => {
            var newSchema = [...schema];
            newSchema[index] = values;
            setSchema(newSchema);
        },
        swap: (fromIndex, toIndex) => {
            if((fromIndex >= 0 && fromIndex < schema.length) && (toIndex >= 0 && toIndex < schema.length)){
                var copySchema = [...schema];
                copySchema[fromIndex] = schema[toIndex];
                copySchema[toIndex] = schema[fromIndex];
                setSchema(copySchema);
            }
        },
        remove: (index) => {
            if((schema.length > 1) && (index >= 0 && index < schema.length)){
                var copySchema = [...schema];
                copySchema.splice(index, 1);
                setSchema(copySchema);
            }
        },
        push: (element) => {
            var copySchema = [...schema];
            copySchema.push(element);
            setSchema(copySchema);
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
        </div>
    );
}  

export default Customizer;