/**
 * @version 1, Octover 12th, 2023
 * @author Andrew Monroe 
 * @author Brady Smith
 * 
 * This component creates a formik form that is then populated
 * by multiple sub-forms representing each stage of the 3 stage
 * estimate calculator.
 */
import './Estimator.css';
import { Formik, Form, yupToFormErrors } from 'formik';
import React, { useEffect, useState, useContext, useMemo } from "react";
import * as Yup from "yup"
import axios from 'axios';
import Calculator from './subForms/Calculator.js';
import Overview from './subForms/Overview.js';
import billableList from '../JSONs/billableList.json';
import Message from '../utilComponents/Message.js';
import { AuthContext } from '../authentication/AuthContextProvider.js';

//Declare initial values for the form, an array of material objects
//and an array of fee objects
const billableSchema = [{
    name: '',
    price: 0.0,
    quantity: 1.0,
    description: '',
    autoImport: "false",
    autoUpdate: "false"
}]

/**
 * This function determines if there are validation errors
 * in the form schema
 * @param {validationSchema} errors, the validation schema 
 * @returns bool, boolean if there are errors or not
 */
function determineErrors(errors, schema) {
    var bool = false;
    console.log(errors)
    // Check for errors in each billable list
    schema.form.forEach((stage, index) => {
        if(errors.form !== undefined && errors.form[index]){
            bool = true;
        }
    });
    return bool;
}

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

function generateFields(stage){
    var blankFields = {
        description: stage.canonicalName,
        autoImport: "false",
        autoUpdate: "false"
    }
    var containsQuantity = false;
    stage.fields.forEach((field) => {
        if(field.name === "Name"){
            blankFields.name = typeSwitch(field.unit);
        }else if(field.name === "Price"){
            blankFields.price = typeSwitch(field.unit);
        }else if(field.name === "Quantity"){
            blankFields.quantity = typeSwitch(field.unit);
            containsQuantity = true;
        }else{
            if(blankFields.inputs === undefined){
                blankFields.inputs = {};
            }
            blankFields.inputs[field.name] = typeSwitch(field.unit);
        }
    })
    if(!containsQuantity){
        blankFields.quantity = 1;
    }
    return [blankFields];
}

/**
 * Automatically generates initial values based off the
 * billableList schema
 * @returns initialValues, the initial values of the form
 */
function generateInitialValues(schema) {
    var initialValues = {form: []};

    schema.form.forEach((stage) => {
        var newStage = {};
        newStage[stage.canonicalName] = generateFields(stage);
        initialValues.form.push(newStage);
    });
    return initialValues;
}

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

function generateFieldSchema(stage){
    var blankSchema = {};
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
 * Automatically generates a Yup validation schema based off the
 * billableList schema
 * @returns formValidation
 */
function generateYupSchema(schema) {

    var blankSchema = { };
    schema.form.forEach((stage) => {
        blankSchema[stage.canonicalName] = Yup.array(Yup.object().shape(
            generateFieldSchema(stage)
        ));
    });
    var arraySchema = Yup.object().shape({
        form: Yup.array(Yup.object().shape(blankSchema))
    });
    return arraySchema;
}

/**
 * This method changes the initial values if estimateInfo
 * has passed down pre-existing data in the form of drafts
 * or auto imports.
 * @param {JSON} initialValues the values of the form
 * @param {JSON} data estimate data passed down from estimate info
 */
function determineBillables(initialValues, data) {
    initialValues.form.forEach((value, index) => {
        if(data.form[index] !== undefined){
            initialValues.form[index] = data.form[index];
        }
    });

    // for (const key of Object.keys(initialValues)) {
    //     if (data.hasOwnProperty(key)) {
    //         initialValues[key] = data[key];
    //     } else {
    //         initialValues[key] = billableSchema;
    //     }
    // }
}

/**
 * This method constructs the data prior to posting to the
 * backend
 * @param {JSON} user the user object
 * @param {JSON} billables the billables
 * @param {String} status the status, complete or draft
 * @returns 
 */
function constructData(user, billables, status) {
    var estimateData = { ...user };
    //Add each billable list to the estimate data
    for (const key of Object.keys(billableList)) {
        var billableArr = {};
        billableArr[billableList[key]] = [...billables[billableList[key]]];
        estimateData = { ...estimateData, ...billableArr }
    }
    //Add status to the estimate data
    estimateData = { ...estimateData, status: status };

    return estimateData;
}

/**
 * This function displays the three stage form. It uses a nave index to
 * keep track of where the user is and displays the correct form stage
 * based on the nav index.
 * 
 * @param {Json Object} props, the selected data from EstimateInfo 
 * @returns JSX object containing all html for the Form
 */
function Estimator(props) {

    const {jwt} = useContext(AuthContext);

    axios.defaults.headers.common = {
        "Authorization": jwt
    }

    //Generate the yup schema
    const validationSchema = useMemo(() => generateYupSchema(props.schema), [props.schema]);
    //Generate the initial values
    var initialValues = useMemo(() => generateInitialValues(props.schema), []);

    //Nav index for keeping track of what stage of the form the user is on
    const [navIndex, setNavIndex] = useState(0);
    const [saved, setSaved] = useState(false);
    const [postError, setPostError] = useState(false);
    const [formValues, setFormValues] = useState(initialValues);

    useEffect(() => {
        setFormValues(determineBillables(initialValues, props.data, props.schema))
    }, []);

    /**
     * Helper function to reload the page on submit
     * or save on draft
     * @param {*} status the status of the estimate
     */
    const handleSubmission = (status) => {
        if (status === "complete") {
            window.location.reload(false);
        } else {
            setSaved(true);
        }
    }

    /**
     * Post the form data to the backend
     * @param {*} values values to post
     * @param {*} status status of this form
     */
    const postDraftData = (values, status) => {
        const estimateData = {user: props.data.user, form: values.form, status: status};
        setPostError(false);

        if(status !== "complete") {
            estimateData.schema = props.schema;
        }
        if(props.data._id !== undefined){
            estimateData._id = props.data._id;
        }

        console.log(estimateData);

        //If this has an id, we know it's a draft
        if (estimateData.hasOwnProperty("_id")) {
            //Put it to the database
            axios.put('/api/estimate/' + estimateData._id.$oid, estimateData, { timeout: 3000 }).then(() => {
                //If complete, reload window
                handleSubmission(status);
            }).catch((error) => {
                console.log(error.message);
                setPostError(true);
            });
        } else {
            //If it doesnt have an id, this is not a draft so post it
            axios.post('/api/estimate', estimateData, { timeout: 3000 }).then((response) => {
                props.setData({...props.data, _id: {$oid: response.data.insertedId.$oid}});
                //If the status is complete, delete from user estimates and
                //refresh the page
                axios.delete(`/api/user?_id=${estimateData.user._id.$oid}`, { timeout: 3000 }).then(() => {
                    handleSubmission(status);
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

    return (
        <div className='materialsForm'>
            <div className='divider'>
                <h2>Estimate Calculator</h2>
                <div className='formNav'>
                    {/**Map over billable list schema to determine form navigation buttons */}
                    {props.schema.form.map((stage, index) => (
                        <button className='button' key={stage.canonicalName + index}
                            onClick={() => { setNavIndex(index) }}>
                            {stage.canonicalName}
                        </button>
                    ))
                    }
                    <button className='button'
                        onClick={() => { setNavIndex(props.schema.form.length) }}>
                        Overview
                    </button>
                </div>
            </div>
            <Formik
                initialValues={formValues}
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
                        {props.schema.form.map((stage, index) => (
                            (navIndex === index ?
                                (<Calculator
                                    values={values.form[index][stage.canonicalName]}
                                    path={`form[${index}][${stage.canonicalName}]`}
                                    index={index}
                                    errors={errors}
                                    touched={touched}
                                    schema={props.schema.form[index]}
                                    generateFields={generateFields}
                                />) : (null))
                        ))
                        }
                        {/**If nav index is at the end of the billable list length */}
                        {navIndex === props.schema.form.length ?
                            (
                                //Display the overview page as well as submit buttons and
                                //any error messages
                                <>
                                    <Overview values={values} schema={props.schema} />
                                    <button type="submit" className='button large'>Submit Estimate</button>
                                    <button type="button" className='button large' onClick={() => {
                                        postDraftData(values, "draft");
                                    }}>Save as Draft</button>
                                    {(determineErrors(errors, props.schema)) ? <div className='center invalid'>Input Errros Prevent Submission</div> : null}
                                    {saved ? <div className='center'>
                                                <Message
                                                    timeout={3000}
                                                    message={"Saved as Draft"}
                                                    setDisplay={setSaved} />
                                            </div> 
                                    : null}
                                    {postError ? <div className='center'>
                                                    <Message
                                                        message={"A network error has occured, could not save estimate. Try again later."}
                                                        setDisplay={setSaved} />
                                                </div> 
                                    : null}
                                </>
                            ) : (null)
                        }
                    </Form>
                )}
            </Formik>
        </div>
    );
}

export default Estimator;