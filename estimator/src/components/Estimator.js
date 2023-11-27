/**
 * @version 1, Octover 12th, 2023
 * @author Andrew Monroe and Brady Smith
 * 
 * This component creates a formik form that is then populated
 * by multiple sub-forms representing each stage of the 3 stage
 * estimate calculator.
 */
import './Estimator.css';
import { Formik, Form } from 'formik';
import React, { useState } from "react";
import * as Yup from "yup"
import axios from 'axios';
import Calculator from './subForms/Calculator.js';
import Overview from './subForms/Overview.js';
import billableList from './JSONs/billableList.json';
import Message from './utilComponents/Message.js';

//Declare initial values for the form, an array of material objects
//and an array of fee objects
const billableSchema = [{
    name: '',
    price: 0.0,
    quantity: 1.0,
    description: '',
    auto_update: "false"
}]

/**
 * This function determines if there are validation errors
 * in the form schema
 * @param {validationSchema} errors, the validation schema 
 * @returns bool, boolean if there are errors or not
 */
function determineErrors(errors){
    var bool = false;
    //Check for errors in each billable list
    for(const key of Object.keys(billableList)){
        if(errors[billableList[key]]){
            bool = true;
        }
    }
    return bool;
}

/**
 * Automatically generates initial values based off the
 * billableList schema
 * @returns initialValues, the initial values of the form
 */
function generateInitialValues(){
    var initialValues = {};
    //Generate inital values from the billableList schema
    for(const key of Object.keys(billableList)){
        initialValues[billableList[key]] = [...billableSchema];
    }
    console.log(initialValues)
    return initialValues;
}

/**
 * Automatically generates a Yup validation schema based off the
 * billableList schema
 * @returns formValidation
 */
function generateYupSchema(){
    var blankSchema = {};
    for(const key of Object.keys(billableList)){
        blankSchema[billableList[key]] = Yup.array(Yup.object().shape({
            name: Yup.string()
                .required('Required')
                .max(20, "Must be less than 20 characters"),
    
            price: Yup.number('Must be a number')
                .required('Required'),
    
            quantity: Yup.number('Must be a number')
                .required('Required')
    
        })).min(1)
    }
    const formValidation = Yup.object(
        blankSchema
    );
    console.log(formValidation);
    return formValidation;
}

/**
 * This method changes the initial values if estimateInfo
 * has passed down pre-existing data in the form of drafts
 * or auto imports.
 * @param {*} initialValues 
 * @param {*} data 
 */
function determineBillables(initialValues, data){
    for(const key of Object.keys(initialValues)){
        if(data.hasOwnProperty(key)){
            initialValues[key] = data[key];
        }
    }
}

/**
 * This method constructs the data prior to posting to the
 * backend
 * @param {JSON} user the user object
 * @param {JSON} billables the billables
 * @param {String} status the status, complete or draft
 * @returns 
 */
function constructData(user, billables, status){
    var estimateData = {...user};
    //Add each billable list to the estimate data
    for(const key of Object.keys(billableList)){
        var billableArr = {};
        billableArr[billableList[key]] = [...billables[billableList[key]]];
        estimateData = {...estimateData, ...billableArr}
    }
    //Add status to the estimate data
    estimateData = {...estimateData, status: status};

    return estimateData;
}

//Generate the yup schema
const validationSchema = generateYupSchema();
//Generate the initial values
var initialValues = generateInitialValues();

/**
 * This function displays the three stage form. It uses a nave index to
 * keep track of where the user is and displays the correct form stage
 * based on the nav index.
 * 
 * @param {Json Object} props, the selected data from EstimateInfo 
 * @returns JSX object containing all html for the Form
 */
function Estimator(props){

    //Nav index for keeping track of what stage of the form the user is on
    const [navIndex, setNavIndex] = useState(0);
    const [saved, setSaved] = useState(false);
    const [postError, setPostError] = useState(false);

    //Determine any pre-existing billables
    determineBillables(initialValues, props.data);

    /**
     * Post the form data to the backend
     * @param {*} values values to post
     * @param {*} status status of this form
     */
    const postDraftData = (values, status) => {
        const estimateData = constructData(props.data, values, status);
        setPostError(false);

        //If this has an id, we know it's a draft
        if(estimateData.hasOwnProperty("_id")){
            //Put it to the database
            axios.put('/estimate/'+ props.data._id.$oid, estimateData, {timeout: 3000}).then((response) => {
                console.log(response);
                setSaved(true);
                //If complete, reload window
                if(status === "complete"){
                    window.location.reload(false);
                }
            }).catch((error) => {
                console.log(error.message);
                setPostError(true);
            });
        }else{
            //If it doesnt have an id, this is not a draft so post it
            axios.post('/estimate', estimateData, {timeout: 3000}).then((response) => {
                console.log(response);
                props.data._id = {$oid: response.data.insertedId.$oid};
                //If the status is complete, delete from user estimates and
                //refresh the page
                axios.delete(`/user?_id=${estimateData.user._id.$oid}`, {timeout: 3000}).then((response) => {
                    console.log(response);
                    //window.location.reload(false);
                }).catch((error) => {
                    console.log(error.message);
                    setPostError(true);
                });
            }).catch((error) => {
                console.log(error.message);
                setPostError(true);
            });
        }
    }

    return(
        <div className='materialsForm'>
            <div className='divider'>
                <h2>Three Stage Estimate Calculator</h2>
                <div className='formNav'>
                    {/**Map over billable list schema to determine form navigation buttons */}
                    {Object.keys(billableList).map((key, index) => (
                        <button className='button' key={index}
                                onClick={() => {setNavIndex(index)}}>
                            {key}s
                        </button>
                    ))
                    }
                    <button className='button'
                            onClick={() => {setNavIndex(Object.keys(billableList).length)}}>
                        Overview
                    </button>
                </div>
            </div>
            <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            validateOnChange={false}
            validateOnBlur={true}
            onSubmit={(values) => postDraftData(values, "complete")}
            >
            {/*Here we are creating an arrow function that returns the form and passing it
            our form values*/}
                {({ values, errors, touched }) => (
                    <Form>
                        {/**Map over billable list schema to generate stages of the estimate form */}
                        {Object.keys(billableList).map((key, index) => (
                            (navIndex === index ? 
                                (<Calculator 
                                        values={values[billableList[key]]} 
                                        name={key} 
                                        errors={errors} 
                                        touched={touched} 
                                />):(null))
                        ))
                        }
                        {/**If nav index is at the end of the billable list length */}
                        {navIndex === Object.keys(billableList).length ? 
                        (
                            //Display the overview page as well as submit buttons and
                            //any error messages
                            <>
                                <Overview values={values} />
                                <button type="submit" className='button large'>Submit Estimate</button>
                                <button type="button" className='button large' onClick={() => {
                                    postDraftData(values, "draft");
                                }}>Save as Draft</button>
                                {(determineErrors(errors)) ? <div className='center invalid'>Input Errros Prevent Submission</div> : null}
                                {saved ? <div className='center'>
                                    <Message
                                        timeout={3000}
                                        message={"Saved as Draft"}
                                        setDisplay={setSaved} />
                                </div> : null}
                                {postError ? <div className='center'>
                                    <Message
                                        message={"A network error has occured, could not save estimate. Try again later."}
                                        setDisplay={setSaved} />
                                </div> : null}
                            </>
                        ):(null)
                        }
                    </Form>
                )}
            </Formik>
        </div>
);
}

export default Estimator;