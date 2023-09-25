import "./EstimateInfo.css";
import axios from 'axios';
import React, {useEffect, useState} from "react";
import Select from 'react-select';
import Estimator from './Estimator.js';

var customerData = [{"fName": "Andrew", "lName": "Monroe", "email": "andrew@fakemail.com", "strAddr": "440 harris road", "city": "Murphy", "state": "NC", "zip": "28906", "measurements": "These are the measurements of the job", "details": "These are the details of the job"},
                    {"fName": "Brady", "lName": "Smith", "email": "brady@fakemail.com", "strAddr": "325 long road", "city": "Asheville", "state": "NC", "zip": "38567", "measurements": "These are the measurements of the job, but for brady", "details": "These are the details of the job, but for brady"},
                    {"fName": "William", "lName": "Kreahling", "email": "drkreahling@fakemail.com", "strAddr": "1909 short road", "city": "Dillsborough", "state": "NC", "zip": "29708", "measurements": "These are the measurements of the job, but for Dr. Kreahling", "details": "These are the details of the job, but for Dr. Kreahling"}];



// async function getFormData(){
//     var customerData = customerData;
//     try {
//         const axiosResponse = await axios.get('/users');
//         customerData = axiosResponse.then((response) => response.data)
//         //console.log(customerData);
//     } catch(error) {
//         //console.log(error);
//     }

//     return customerData;
// }

function populateDropDown(data){
    var outputData = []
    data.forEach(entry =>{
        outputData.push(
            {value: entry, label: entry.fName + " " + entry.lName}
        );
    });
    return outputData;
}

// function renderCustomerData(customerData, element){
//     console.log(customerData)
//     console.log(element)
//     if(customerData !== null && customerData[element] !== null){
//         return(
//             <p>{customerData[element]}</p>
//         );
//     }
// }

function EstimateInfo(){
    
    const [currentCustomerData, setCurrentCustomerData] = useState({"fName": "", "lName": "", "email": "", "strAddr": "", "city": "", "state": "", "zip": "", "measurements": "", "details": ""});
    
    // useEffect(() => {
    //     customerData = getFormData();
    // })

    const handleChange = (selectedOption) => {
        setCurrentCustomerData(selectedOption.value);
    }

    return(
        <div className='estimateInfo'>
            <div className='dropDown'>
                <h2 id="selectTitle">{customerData.length} Customers Waiting for an Estimate</h2>
                <Select 
                    className="select" 
                    options={populateDropDown(customerData)}
                    onChange={handleChange} 
                />
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