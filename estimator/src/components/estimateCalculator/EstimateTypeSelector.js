/**
 * @version 1, March 17th, 2024
 * @author Andrew Monroe 
 * @author Brady Smith
 * 
 * This method wraps the estimator component and passes it all the data
 * it needs.
 */

import React, { useContext, useState, useMemo } from "react";
import Select from 'react-select';
import { SchemaContext } from "../estimateCustomizer/SchemaContextProvider";
import Estimator from "./Estimator";
import "./EstimateTypeSelector.css";
import axios from 'axios';

/**
 * This method populates the preset selector dropdown.
 * @param {*} schema 
 * @returns 
 */
const populateEstimateTypes = (schema) => {
    var dropDownData = [];
    schema.forEach(element => {
        dropDownData.push({value: element, label: element.estimateType});
    });
    return dropDownData;
}

/**
 * Get all of the materials that are marked for auto import
 * from the database.
 * 
 * @returns autoImports, promise of the auto import JSON.
 */
async function getAutoImports(schema, setLoading, setEstimateData, data) {
    //Array of billables
    var billableArr = [];

    //Retrieve all auto imports
    var promises = [];
    for(const stage of schema.form){
        promises.push(
            axios.get("/api/library?autoImport=true&presetID=" + schema.presetID + "&stageID=" + stage.stageID).then((response) => {
                console.log(response)
                if(response.data.length > 0){
                    var billable = {}
                    billable[stage.canonicalName] = [...response.data];

                    billableArr.push({...billable});
                }
            })
        );
    }

    /*
     *Wait for all promises to resolve
     */
    Promise.all(promises).then(() => {
        console.log(billableArr)
        setLoading(false);
        setEstimateData({...data, form: billableArr});
    });
}

/**
 * This function returns the JSX for the estimate type selector
 * 
 * @param {Object} props, values passed down from EstimateInfo
 * @returns {JSXElement} EstimateTypeSelector
 */
function EstimateTypeSelector(props){

    //Pull in the schema context
    const {schema} = useContext(SchemaContext);
    //Selected schema
    const [selectedType, setSelectedType] = useState(props.schema);
    //Current estimate data
    const [estimateData, setEstimateData] = useState(props.data);
    //Loading boolean for auto import request
    const [loading, setLoading] = useState(false);
    //Drop down array data
    const dropDownData = useMemo(() => populateEstimateTypes(schema), [schema]);
    
    /**
     * This function handles the change of the selected preset.
     * 
     * @param {Object} selectedOption, the newly selected preset
     */
    const handleChange = (selectedOption) => {
        setLoading(true);
        setSelectedType(selectedOption.value);
        console.log(selectedOption.value)
        if(!props.data.hasOwnProperty("_id")){
            getAutoImports(selectedOption.value, setLoading, setEstimateData, estimateData);
        }
    }

    return(
        <>
            {selectedType !== undefined ? (
                (loading ? (<h2 className="Centered" style={{marginBottom: "50px"}}>Loading...</h2>) : 
                (<Estimator 
                    data={estimateData} 
                    setData={setEstimateData} 
                    schema={selectedType} 
                    key={props.data.user._id.$oid}
                />))
            ) : (
                <div className="SelectEstimateWrapper">
                    <Select 
                        className="EstimateTypeSelect" 
                        options={dropDownData} 
                        onChange={handleChange} 
                        placeholder='Select Estimate Type...'
                    />
                </div>
            )}
        </>
    );
}

export default EstimateTypeSelector;