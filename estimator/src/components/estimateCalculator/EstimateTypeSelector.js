import React, { useContext, useState, useMemo } from "react";
import Select from 'react-select';
import { SchemaContext } from "../estimateCustomizer/SchemaContextProvider";
import Estimator from "./Estimator";
import "./EstimateTypeSelector.css";
import axios from 'axios';

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
function getAutoImports(schema, data, setEstimateData) {
    var autoImports = [];
    console.log(schema)
    schema.form.forEach((value, index) => {
        axios.get("/api/library?autoImport=true&description=" + value.canonicalName + "&type=" + schema.estimateType).then((response) => {
            if (response.data.length > 0) {
                //Add that array of billables to the user object
                var billable = {}
                billable[value.canonicalName] = response.data;
                autoImports.push(billable);
            }
        });
    });
    console.log(JSON.stringify(autoImports));
    setEstimateData({...data, form: autoImports});
}

function EstimateTypeSelector(props){

    const {schema} = useContext(SchemaContext);
    const [selectedType, setSelectedType] = useState(props.schema);
    const [estimateData, setEstimateData] = useState(props.data);
    const dropDownData = useMemo(() => populateEstimateTypes(schema), [schema]);
    console.log(estimateData)
    
    const handleChange = (selectedOption) => {
        setSelectedType(selectedOption.value);
        console.log(selectedOption.value)
        if(!props.data.hasOwnProperty("_id")){
            getAutoImports(selectedOption.value, estimateData, setEstimateData)
        }
        console.log(estimateData);
    }

    return(
        <>
            {selectedType !== undefined ? (
                <Estimator data={estimateData} setData={setEstimateData} schema={selectedType} key={props.data.user._id.$oid}/>
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