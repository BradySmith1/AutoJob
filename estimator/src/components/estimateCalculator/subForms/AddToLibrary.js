/**
 * @version 1, Octover 12th, 2023
 * @author Andrew Monroe 
 * @author Brady Smith
 * 
 * This component displays a pop up, self containted sub form
 * that adds materials to the material library
 */

import React from "react";
import './AddToLibrary.css';
import { useFormik } from 'formik';
import * as Yup from "yup"

/**
 * This method will determine the default value
 * for inputs based on the unit given in the schema.
 * 
 * @param {string} unit
 * @returns {string | Number} defaultValue
 */
function typeSwitch(unit){
    var defaultValue;
    switch(unit){
        case "Text":
            defaultValue = "";
            break;
        case "Number":
            defaultValue = 0.0;
            break;
    }
    return defaultValue;
}

/**
 * This method generates the default fields for the
 * initial values of a stage based off of the schema.
 * 
 * @param {Object} stage, stage schema
 * @returns {Object[]} blankeFields, the initial values 
 *                                   object of the stage
 */
function generateFields(selectedLib){
    var blankFields = {
        name: "",
        price: 0.0,
        quantity: 1,
        description: selectedLib.name,
        autoImport: "false",
        autoUpdate: "false",
        presetID: selectedLib.pID,
        stageID: selectedLib.sID
    }
    selectedLib.schema.fields.forEach((field) => {
        if(field.name !== "Name" && field.name !== "Price" && field.name !== "Quantity"){
            if(blankFields.inputs === undefined){
                blankFields.inputs = {};
            }
            blankFields.inputs[field.name] = typeSwitch(field.unit);
    }})
    console.log(blankFields)
    return blankFields;
}

/**
 * This function returns the correct type of
 * validation schema for a field based of the
 * unit field in the schema.
 * 
 * @param {string} unit 
 * @returns {Yup.string() | Yup.number()} defaultValye
 */
function schemaSwitch(unit){
    var defaultValue;
    switch(unit){
        case "Text":
            defaultValue = Yup.string()
            .required('Required')
            .max(20, "Must be less than 20 characters");
            break;
        case "Number":
            defaultValue = Yup.number()
            .required('Required');
            break;
    }
    return defaultValue;
}

/**
 * This function genereates the valdiation schema for a stage
 * of the estimate calculator from the preset
 * schema.
 * 
 * @param {Object} stage, stage schema
 * @returns {Object} object containing yup constraints
 */
function generateFieldSchema(stage){
    var blankSchema = {};
    //Loop through fields of stage schema
    stage.fields.forEach((stage) => {
        if(stage.name !== "Name" && stage.name !== "Price" && stage.name !== "Quantity"){
            blankSchema[stage.name] = schemaSwitch(stage.unit);
        }
    });
    return {
        inputs: Yup.object().shape(blankSchema),
        name: Yup.string()
            .required('Required')
            .max(20, "Maximum of 20 characters"),
        price: Yup.number()
            .required('Required'),
        quantity: Yup.number()
            .required('Required'),
        description: Yup.string()
            .required('Required'),
        autoImport: Yup.string()
            .required('Required'),
        autoUpdate: Yup.string()
            .required('Required')
    };
}

/**
 * 
 * @param {JSON object} props 
 *      props.addToLibrary function to change the values of the library
 *      props.name name of the billable
 *      props.setDisplay controls when to stop rendering this component
 * @returns JSX object containing all the html for the pop up form
 */
function AddToLibrary(props){

    const formik = useFormik({
        //Declare initial values for the form
        initialValues: generateFields(props.selectedLib),
    
        //Declare a validation schema for the form
        validationSchema: Yup.object(
           generateFieldSchema(props.selectedLib.schema)
        ),

        /**
         * Submit function
         * @param {JSON} values the values to submit
         * @param {function} resetForm the formik resetForm function
         */
        onSubmit: (values, { resetForm }) => {
            props.addToLibrary(values);
            resetForm();
        }
    
    });


    return(
        <div className="Back">
            <div className="formContainer">
                <h2>Add to {props.selectedLib.name}</h2>
                <div id="libraryForm">
                    {/**Input field for the name of the billable and error messages */}
                    <div className="boxAndLable">
                        <h3>Name</h3>
                        <input
                            className="inputBox customBox" 
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
                            className="inputBox customBox" 
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
                    {(formik.values.inputs !== undefined) && Object.keys(formik.values.inputs).map((key) => 
                        (
                        <div className="boxAndLable" key={key}>
                            <h3>{key}</h3>
                            <input
                                className="inputBox customBox" 
                                type={typeof(formik.values.inputs[key]) == "number" ? ("number") : ("text")} 
                                id={`inputs[${key}]`}
                                name={`inputs[${key}]`}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.inputs[key]}
                            >
                            </input>
                            {/**Fix this, for some reason undefined */}
                            {/* {formik.touched.inputs[key] && formik.errors.inputs[key] ? <p className="error">{formik.errors.inputs[key]}</p> : null} */}
                        </div>
                    ))}
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
                        props.displayControls.clearDisplays();
                        // props.setDisplay(false);
                    }}>
                    Close
                </button>
            </div>
        </div>
    )
}

export default AddToLibrary;