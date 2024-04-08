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
async function getAutoImports(schema, setLoading, setEstimateData, data) {
    var billableArr = [];

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

    Promise.all(promises).then(() => {
        console.log(billableArr)
        setLoading(false);
        setEstimateData({...data, form: billableArr});
    });
}

function EstimateTypeSelector(props){

    const {schema} = useContext(SchemaContext);
    const [selectedType, setSelectedType] = useState(props.schema);
    const [estimateData, setEstimateData] = useState(props.data);
    const [loading, setLoading] = useState(false);
    const dropDownData = useMemo(() => populateEstimateTypes(schema), [schema]);
    
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