import "./EstimateInfo.css";
import axios from 'axios';
import React, {useEffect, useState} from "react";
import Select from 'react-select';
import Estimator from './Estimator.js';

//"/estimate"

function populateDropDown(data){
    var outputData = []
    data.forEach(entry =>{
        outputData.push(
            {value: entry, label: entry.fName + " " + entry.lName}
        );
    });
    return outputData;
}

function EstimateInfo(){
    
    const [currentCustomerData, setCurrentCustomerData] = useState({"fName": "", "lName": "", "email": "", "strAddr": "", "city": "", "state": "", "zip": "", "measurements": "", "details": ""});
    
    var [loading, setLoading] = useState(true);
    var [customerData, setCustomerData] = useState([{"fName": "", "lName": "", "email": "", "strAddr": "", "city": "", "state": "", "zip": "", "measurements": "", "details": ""}]);

     useEffect(() => {
        try{
            axios.get('/users').then((response) => {
                setCustomerData(response.data);
                setLoading(false);
            });
        } catch(error){
            console.log(error);
        }
     }, [])

    const handleChange = (selectedOption) => {
        setCurrentCustomerData(selectedOption.value);
    }

    return(
        <div className='estimateInfo'>
            <div className='dropDown'>
                <h2 id="selectTitle">{customerData.length} Customers Waiting for an Estimate</h2>
                {loading ? <h2>loading</h2> : <Select 
                    className="select" 
                    options={populateDropDown(customerData)}
                    onChange={handleChange} 
                />}
            </div>
            <div className="customerInfo">
                <div className="infoContainer">
                    <div className="infoElement">
                        <h2 class="infoHeading">Contact</h2>
                        <div className="info">
                            {currentCustomerData.fName} {currentCustomerData.lName} <br/>
                            {currentCustomerData.email}
                        </div>
                    </div>
                    <div className="infoElement">
                        <h2 class="infoHeading">Address</h2>
                        <div className="info">
                            {currentCustomerData.strAddr} <br/>
                            {currentCustomerData.city} {currentCustomerData.state} {currentCustomerData.zip}
                        </div>
                    </div>
                </div>
                <div className="infoContainer">
                    <div className="infoElement">
                        <h2 class="infoHeading">Surfaces and Measurements</h2>
                        <div className="info">
                            {currentCustomerData.measurements}
                        </div>
                    </div>
                    <div className="infoElement">
                        <h2 class="infoHeading">Job Details</h2>
                        <div className="info">
                        {currentCustomerData.details}
                        </div>
                    </div>
                </div>
            </div>
            <div className="images">
                <div className="image">Image</div>
                <div className="image">Image</div>
                <div className="image">Image</div>
            </div>
            <Estimator data={currentCustomerData} />
        </div>
    );
}

export default EstimateInfo;
