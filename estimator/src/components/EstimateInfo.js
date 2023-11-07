/**
 * @version 1, Ovtober 12th, 2023
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
import ImageCarousel from "./ImageCarousel";
import billableList from "./JSONs/billableList.json"

const DEFAULT_ESTIMATE_DATA = {user: {"fName": "", "lName": "", "email": "", "strAddr": "", "city": "", "state": "", "zip": "", "measurements": "", "details": ""}};

async function packUsers(){
    return new Promise((resolve) => {
        axios.get('/users').then((response) => {
            //Set the customer data to the axios response
            var userArr = [];
            for(const entry of response.data){
                userArr.push({user: entry});
            }
            for(const key of Object.keys(billableList)){
                axios.get("/library?auto_update=true&description=" + key).then((response) => {
                    console.log(response);
                    for(var user of userArr){
                        if(response.data.length > 0){
                            user[billableList[key]] = response.data;
                        }
                    }
                })
            }
            resolve(userArr)
        });
    })
}

async function packDrafts(){
    return new Promise((resolve) => {
        axios.get('/estimate?status=draft').then((response) => {
            resolve(response.data);
        });
    });
}

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
            {value: entry, label: entry.user.fName + " " + entry.user.lName}
        );
    });
    //return the array of Jsons for the drop down.
    return outputData;
}

const defaultImages = [];

/**
 * This function returns the JSX object for the estimate calculator and
 * contains all the html for it.
 * 
 * @returns JSX object for estimate calculator
 */
function EstimateInfo(){
    
    //Declare a use state variable that holds the currently selected customer data
    const [currentCustomerData, setCurrentCustomerData] = useState(DEFAULT_ESTIMATE_DATA);
    
    //Declare a boolean loading use state to keep track of when the
    //axios get request returns what we need
    const [userLoading, setUserLoading] = useState(true);
    const [estimateLoading, setEstimateLoading] = useState(true);
    const [images, setImages] = useState(defaultImages);

    //Declare a use state variable that holds the default customer data
    const [customerData, setCustomerData] = useState([DEFAULT_ESTIMATE_DATA]);
    const [draftData, setDraftData] = useState([DEFAULT_ESTIMATE_DATA]);

    //This function runs when the page is first loaded
    useEffect(() => {
        try{
            //Get all the customer data
            packUsers().then((data) => {
                setCustomerData(data);
                //Set the loading variable to false
                setUserLoading(false);
            } );
            packDrafts().then((data) => {
                setDraftData(data);
                setEstimateLoading(false);
            })
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
        if(selectedOption.value.user.hasOwnProperty("images")){
            setImages(selectedOption.value.user.images);
        }else{
            setImages([]);
        }
    }

    //Return the json object containing all html for this page
    return(
        <div className='estimateInfo'>
            <div className='dropDown'>
                <div className="selectWrapper">
                    <h2 id="selectTitle">{customerData.length} Customers Waiting for an Estimate</h2>
                    {/*If axios has not responded, display an h2 that says loading
                    otherwise, show the drop down */}
                    {userLoading ? <h2>loading...</h2> : <Select 
                    className="select" 
                    options={populateDropDown(customerData)}
                    onChange={handleChange} 
                    placeholder='Select Customer...'
                    />}
                </div>
                <div className="selectWrapper">
                    <h2 id="selectTitle">{draftData.length} Unfinished Estimate Drafts</h2>
                    {/*If axios has not responded, display an h2 that says loading
                    otherwise, show the drop down */}
                    {estimateLoading ? <h2>loading...</h2> : <Select 
                    className="select" 
                    options={populateDropDown(draftData)}
                    onChange={handleChange}
                    placeholder='Select Draft...' 
                    />}
                </div>
            </div>
            <div className="customerInfo">
                <div className="infoContainer">
                    <div className="infoElement">
                        <h2 className="infoHeading">Contact</h2>
                        <div className="info">
                            {currentCustomerData.user.fName} {currentCustomerData.user.lName} <br/>
                            {currentCustomerData.user.email}
                        </div>
                    </div>
                    <div className="infoElement">
                        <h2 className="infoHeading">Address</h2>
                        <div className="info">
                            {currentCustomerData.user.strAddr} <br/>
                            {currentCustomerData.user.city} {currentCustomerData.user.state} {currentCustomerData.user.zip}
                        </div>
                    </div>
                </div>
                <div className="infoContainer">
                    <div className="infoElement">
                        <h2 className="infoHeading">Surfaces and Measurements</h2>
                        <div className="info">
                            {currentCustomerData.user.measurements}
                        </div>
                    </div>
                    <div className="infoElement">
                        <h2 className="infoHeading">Job Details</h2>
                        <div className="info">
                        {currentCustomerData.user.details}
                        </div>
                    </div>
                </div>
            </div>
            <ImageCarousel images={images} />
            {/**Only display the calculator if there is a selected customer, and give it a key so it refreshes*/}
            {currentCustomerData.user.fName !== "" 
                ? 
                <Estimator data={currentCustomerData} 
                key={currentCustomerData.user._id.$oid}/> 
                : 
                null
            }
        </div>
    );
}

export default EstimateInfo;
