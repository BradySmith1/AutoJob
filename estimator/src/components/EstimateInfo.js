/**
 * @version 1, September 28th, 2023
 * @author Andrew Monroe and Brady Smith
 * 
 * This component takes all the customer info entries, entered in the estimate form,
 * and retrieves them from the database. It then lets you select one of them from the
 * drop down and uses the estimator component to let you fill out an estimate for them.
 * 
 * Uses axios get request to retrieve information from the database and react-select for
 * the drop down.
 */

import "./EstimateInfo.css";
import axios from 'axios';
import React, {useEffect, useState} from "react";
import Select from 'react-select';
import Estimator from './Estimator.js';

/**
 * This function takes in an array of json of customer data and creates an
 * array of json objects used to populate the drop down selector.
 * 
 * @param {[Json Object]} data 
 * @returns {[Json Object]} outputData
 */
function populateDropDown(data){
    //Create an empty array
    var outputData = []
    //loop through the customer data
    data.forEach(entry =>{
        //Push a json for the drop down, made from customer data
        outputData.push(
            {value: entry, label: entry.fName + " " + entry.lName}
        );
    });
    //return the array of Jsons for the drop down.
    return outputData;
}

/**
 * This function returns the JSX object for the estimate calculator and
 * contains all the html for it.
 * 
 * @returns JSX object for estimate calculator
 */
function EstimateInfo(){
    
    //Declare a use state variable that holds the currently selected customer data
    const [currentCustomerData, setCurrentCustomerData] = useState({"fName": "", "lName": "", "email": "", "strAddr": "", "city": "", "state": "", "zip": "", "measurements": "", "details": ""});
    
    //Declare a boolean loading use state to keep track of when the
    //axios get request returns what we need
    var [loading, setLoading] = useState(true);

    //Declare a use state variable that holds the default customer data
    var [customerData, setCustomerData] = useState([{"fName": "", "lName": "", "email": "", "strAddr": "", "city": "", "state": "", "zip": "", "measurements": "", "details": ""}]);

    //This function runs when the page is first loaded
    useEffect(() => {
        try{
            //Get all the customer data
            axios.get('/users').then((response) => {
                //Set the customer data to the axios response
                setCustomerData(response.data);
                //Set the loading variable to false
                setLoading(false);
            });
        } catch(error){
            //If an error occurs, log it
            console.log(error);
        }
    }, [])

    //This function handles the change of the selected drop down
    //item.
    const handleChange = (selectedOption) => {
        //Set the current customer data to the selected value
        setCurrentCustomerData(selectedOption.value);
    }

    //Return the json object containing all html for this page
    return(
        <div className='estimateInfo'>
            <div className='dropDown'>
                <h2 id="selectTitle">{customerData.length} Customers Waiting for an Estimate</h2>
                {/*If axios has not responded, display an h2 that says loading
                   otherwise, show the drop down */}
                {loading ? <h2>loading...</h2> : <Select 
                    className="select" 
                    options={populateDropDown(customerData)}
                    onChange={handleChange} 
                />}
            </div>
            <div className="customerInfo">
                <div className="infoContainer">
                    <div className="infoElement">
                        <h2 className="infoHeading">Contact</h2>
                        <div className="info">
                            {currentCustomerData.fName} {currentCustomerData.lName} <br/>
                            {currentCustomerData.email}
                        </div>
                    </div>
                    <div className="infoElement">
                        <h2 className="infoHeading">Address</h2>
                        <div className="info">
                            {currentCustomerData.strAddr} <br/>
                            {currentCustomerData.city} {currentCustomerData.state} {currentCustomerData.zip}
                        </div>
                    </div>
                </div>
                <div className="infoContainer">
                    <div className="infoElement">
                        <h2 className="infoHeading">Surfaces and Measurements</h2>
                        <div className="info">
                            {currentCustomerData.measurements}
                        </div>
                    </div>
                    <div className="infoElement">
                        <h2 className="infoHeading">Job Details</h2>
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
            {/*Display the estimator component and pass it the current customer data*/}
            {console.log(currentCustomerData)}
            {currentCustomerData.fName != "" ? <Estimator data={currentCustomerData} key={currentCustomerData._id.$oid}/> : null}
        </div>
    );
}

export default EstimateInfo;
