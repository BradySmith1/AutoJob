/**
 * @version 1, April 30th, 2024
 * @author Andrew Monroe 
 * @author Brady Smith
 * 
 * This component is the front end for the price scanner.
 */

import axios from "axios"
import React, { useState, useContext } from "react"
import { useFormik, yupToFormErrors } from 'formik';
import * as Yup from "yup";
import "./Scanner.css";
import { NotificationContext } from "../../utilComponents/NotificationProvider";

//Styles for the selected company button
const selectedButton = {
    backgroundColor: '#0055FF',
    width: '140px',
    margin: '0px'
}

//Style for the unslected company button
const deselectedButton = {
    backgroundColor: '#000b21',
    width: '140px',
    margin: '0px'
}

//Style for white text
const white = {
    color: 'white',
    fontWeight: 'normal'
}

//Backend company name for home depot
const homeDepot = 'homedepot';
//Backend company name for lowes
const lowes = 'lowes'

//Text to display info on a found item
var foundText = ''

/**
 * This function sets the foundText
 * 
 * @param {string} itemName, name of the found item 
 * @param {number} price, price of the found item 
 * @param {number} storeNumber, number of the store of the found item 
 */
function setFoundText(itemName, price, storeNumber){
    foundText = `Found item, ${itemName}, for $${price} at store number ${storeNumber}.`;
}

/**
 * This function returns the JSX element of the scanner
 * component. 
 * 
 * @param {Object} props, values passed down from library 
 * @returns {JSXElement} Scanner
 */
function Scanner(props){

    //State value for the stage of the price search
    const [searching, setSearching] = useState('none');
    //State for the selected company
    const [company, setCompany] = useState('homedepot');
    //addMessage function from notification context
    const {addMessage} = useContext(NotificationContext);
    //State for error message
    const [error, setError] = useState('');
    //State to hold the found item
    const [foundItem, setFoundItem] = useState({});

    const formik = useFormik({
        //Declare initial values for the form
        initialValues: {
            zip: "",
            name: props.scanBillable.billable.data.name
        },

        //Declare a validation schema for the form
        validationSchema: Yup.object({
            zip: Yup.string()
                .max(5, "Invalid Zip Code")
                .min(5, "Invalid Zip Code")
                .matches(/^[0-9]+$/, "Invalid Zip Code")
                .required("Required"),
            name: Yup.string()
                .max(40, "Maximum of 40 characters")
                .required("Required")
        }),

        //This function runs when the submit button is clicked
        onSubmit: (values) => {
            setSearching('searching');
            axios.get('/api/scrape?zip=' + values.zip + 
                      '&name=' + values.name +
                      "&company=" + company).then((response) => {
                if(response.data === "no products found"){
                    setSearching('error');
                    setError('No Products Found');
                    return;

                }
                console.log(response.data)
                setFoundText(response.data.name, response.data.price.toFixed(2), response.data.store_number);
                setFoundItem(response.data);
                setSearching('found');
                
            }).catch((error) => {
                console.log(error)
                if (error.response) {
                    setError(error.response.data);
                } else if (error.request){
                    setError(error.request.data);
                }else{
                    setError(error.message);
                }
                setSearching('error')
                addMessage("A network error has occured, cannot retrieve price.", 5000);
            })
        }
    });

    return(
        <div className="Back">
            <div className="formContainer" style={{width: '350px'}}>
                    <>
                        <span className="compnayWrapper">
                            <h3 style={white}>Get Price From: </h3>
                            <div className="CompanySelect">
                                <button className="button seperate"
                                    style={company === homeDepot ? (selectedButton) : (deselectedButton)}
                                    onClick={() => {
                                        setCompany(homeDepot);
                                    }}
                                >
                                    Home Depot
                                </button>
                                <button className="button"
                                    style={company === lowes ? (selectedButton) : (deselectedButton)}
                                    onClick={() => {
                                        setCompany(lowes);
                                    }}
                                >
                                    Lowes
                                </button>
                            </div>
                        </span>
                        <form id='scrapeForm' onSubmit={formik.handleSubmit}>
                            {/*Zip code input field*/}
                            <span>
                                <h3 style={white}>Zip Code:</h3>
                                <input
                                    style={{margin: '0px'}}
                                    className="inputBox"
                                    type="number"
                                    id="zip"
                                    name="zip"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.zip}
                                    placeholder='12345'
                                />
                                {formik.touched.zip && formik.errors.zip ? <p className="Error">{formik.errors.zip}</p> : null}
                            </span>
                            {/*Name input field*/}
                            <div className="searchingWrapper" style={{marginBottom: '20px'}}>
                                <h3 style={white}>Searching Prices For:</h3>
                                <input
                                    style={{margin: '0px'}}
                                    className="inputBox"
                                    type="text"
                                    id="name"
                                    name="name"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.name}
                                />
                                {formik.touched.name && formik.errors.name ? <p className="Error">{formik.errors.name}</p> : null}
                            </div>
                            <input
                                className="btn"
                                type="submit"
                                id="submitButton"
                            />
                        </form>
                        {/*Display this while searching*/}
                        {searching === 'searching' ? (
                            <p style={{...white, maxWidth: '200px', marginLeft: 'auto', marginRight: 'auto'}}>
                                Searching for price, this may take a moment.
                            </p>
                        ) : (null)}
                        {/*Display this on error*/}
                        {searching === 'error' ? (
                            <p style={{...white, maxWidth: '200px', color: 'red', marginLeft: 'auto', marginRight: 'auto'}}>
                                {error}
                            </p>
                        ) : (null)}
                        {/*Display this when a price is founds*/}
                        {searching === 'found' ? (
                            <>
                                <p style={{...white, maxWidth: '200px', marginLeft: 'auto', marginRight: 'auto', wordWrap: 'break-word'}}>
                                    {foundText}
                                </p>
                                {/*Use this price button*/}
                                <button className="btn add" onClick={() => {
                                    //This button send a put request to update the price of the billable
                                    var newBillable = {...props.scanBillable};
                                    const oldPrice = props.scanBillable.billable.data.price;
                                    newBillable.billable.data.price = Number(foundItem.price.toFixed(2));
                                    props.modifyLibrary(props.scanBillable.index, newBillable.billable.data);

                                    axios.put('/api/library?_id=' + newBillable.billable.data._id.$oid, newBillable.billable.data).then((respone) => {                              
                                        setSearching("tick");

                                    }).catch((error) => {
                                        addMessage("Network error, could not update price.", 5000);
                                        var oldBillable = {...newBillable};
                                        oldBillable.billable.data.price = oldPrice;
                                        props.modifyLibrary(newBillable.index, oldBillable.billable.data);

                                    })
                                }}>
                                    Use This Price
                                </button>
                            </>
                        ) : (null)}
                        {/*Display this when the price has been used*/}
                        {searching === 'tick' ? (
                            <>
                                <p style={{...white, maxWidth: '200px', marginLeft: 'auto', marginRight: 'auto', wordWrap: 'break-word'}}>
                                    Automatically keep price up to date in the background?
                                </p>
                                <div className="YesNoWrapper">
                                    {/*Yes button */}
                                    <button className="btn" onClick={() => {
                                        //This button sends a put request to update the auto update field
                                        var newBillable = {...props.scanBillable};
                                        console.log(newBillable.billable.data.autoUpdate);
                                        newBillable.billable.data.autoUpdate = "true";
                                        props.modifyLibrary(props.scanBillable.index, newBillable.billable.data);

                                        axios.put('/api/library?_id=' + newBillable.billable.data._id.$oid, newBillable.billable.data).then((respone) => {
                                            console.log(respone);
                                            setSearching("null");

                                        }).catch((error) => {
                                            console.log(error);
                                            console.log(error.message)
                                            addMessage("Network error, could not update price.", 5000);
                                            var oldBillable = {...newBillable};
                                            oldBillable.billable.data.autoUpdate = 'false';
                                            props.modifyLibrary(newBillable.index, oldBillable.billable.data);

                                        })
                                    }}>
                                        Yes
                                    </button>
                                    {/*No button */}
                                    <button className="btn" onClick={() => {
                                        setSearching("complete");
                                    }}>
                                        No
                                    </button>
                                </div>
                            </>
                        ) : (null)}
                    </>
                {/*Close button*/}
                <button 
                    className="btn exit" 
                    style={{position: 'absolute',
                            bottom: '-45px',
                            left: '145px',}}
                    onClick={() => {
                        //On click, stop displaying this component
                        props.displayControls.clearDisplays();
                        // props.setDisplay(false);
                    }}>
                    Close
                </button>
            </div>
        </div>
    )
}

export default Scanner