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
import "./Customizer.css";

function Customizer(){
    const [schema, setSchema] = useState(schemaJSON);

    const changeSchema = (values, index) => {
        var newSchema = [...schema];
        newSchema[index] = values;
        setSchema(newSchema);
        //setSchema([...schema, ...[values]]);
    }

    return(
        <div className="Customizer">
            <div className='TitleBar'>
                <h1>Estimate Presets</h1>
            </div>
            <div className="PresetsWrapper">
                {schema.map((estimate, index) => {
                    return(<EstimatePreset id={index + estimate.estimateType} estimate={estimate} setSchema={changeSchema} index={index}/>);
                })}
            </div>
        </div>
    );
}  

export default Customizer;