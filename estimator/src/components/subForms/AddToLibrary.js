/**
 * @version 1, Octover 12th, 2023
 * @author Andrew Monroe and Brady Smith
 * 
 * This component displays a pop up, self containted sub form
 * that adds materials to the material library
 */

import React from "react";
import './AddToLibrary.css';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from "yup"

/**
 * 
 * @param {JSON object} props 
 *      props.values the values of the library
 *      props.setValues function to change the values of the library
 *      props.name name of the billable
 *      props.setDisplay controls when to stop rendering this component
 * @returns JSX object containing all the html for the pop up form
 */
function AddToLibrary(props){

    const formik = useFormik({
        //Declare initial values for the form
        initialValues: {
            name: "",
            price: 0.0,
            quantity: 1,
            description: props.name,
            auto_update: "false"
        },
    
        //Declare a validation schema for the form
        validationSchema: Yup.object({
            name: Yup.string()
                .required('Required')
                .max(20, "Must be less than 20 characters"),
    
            price: Yup.number('Must be a number')
                .required('Must be a number'),
        }),

        //submit function for the form
        onSubmit: (values, { resetForm }) => {
            axios.post('/library', values).then((response) => {
                values._id = {"$oid" : response.data.insertedId.$oid};
                console.log(response);
                props.setValues([...props.values, values]);
                resetForm();
            });
        }
    
    });


    return(
        <div className="Back">
            <div className="formContainer">
                <h2>Add a new {props.name}</h2>
                <div id="libraryForm">
                    {/**Input field for the name of the billable and error messages */}
                    <div className="boxAndLable">
                        <h3>Name</h3>
                        <input
                            className="inputBox" 
                            type="text" 
                            id="name" 
                            name="name"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.name}
                        >
                        </input>
                        {formik.touched.name && formik.errors.name ? <p className="error">{formik.errors.name}</p> : null}
                    </div>
                    {/**Input field for the price of the billable and error messages */}
                    <div className="boxAndLable">
                        <h3>Price</h3>
                        <input
                            className="inputBox" 
                            type="number" 
                            id="price" 
                            name="price"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.price}
                        >
                        </input>
                        {formik.touched.price && formik.errors.price ? <p className="error">{formik.errors.name}</p> : null}
                    </div>
                    {/**Submit button */}
                    <button
                        type="submit"
                        className="submitBtn btn"
                        id="submitBtn"
                        onClick={formik.handleSubmit}
                    >
                        Submit
                    </button>
                </div>
                <button 
                    className="btn exit" 
                    onClick={() => {
                        //On click, stop displaying this component
                        props.setDisplay(false);
                    }}>
                    Close
                </button>
            </div>
        </div>
    )
}

export default AddToLibrary;