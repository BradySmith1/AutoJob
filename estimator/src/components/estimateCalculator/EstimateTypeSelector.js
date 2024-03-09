import React, { useContext, useState, useMemo } from "react";
import Select from 'react-select';
import { SchemaContext } from "../estimateCustomizer/SchemaContextProvider";
import Estimator from "./Estimator";
import "./EstimateTypeSelector.css"

const populateEstimateTypes = (schema) => {
    var dropDownData = [];
    schema.forEach(element => {
        dropDownData.push({value: element, label: element.estimateType});
    });
    return dropDownData;
}

function EstimateTypeSelector(props){

    const {schema} = useContext(SchemaContext);
    const [selectedType, setSelectedType] = useState(props.schema);
    const dropDownData = useMemo(() => populateEstimateTypes(schema), [schema])
    
    const handleChange = (selectedOption) => {
        setSelectedType(selectedOption.value);
    }

    return(
        <>
            {selectedType !== undefined ? (
                <Estimator data={props.data} schema={selectedType} key={props.data.user._id.$oid}/>
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