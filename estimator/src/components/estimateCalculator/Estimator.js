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
import { Formik, Form } from 'formik';
import React, { useState, useContext, useMemo } from "react";
import * as Yup from "yup"
import axios from 'axios';
import Calculator from './subForms/Calculator.js';
import Overview from './subForms/Overview.js';
import Message from '../utilComponents/Message.js';
import { AuthContext } from '../authentication/AuthContextProvider.js';

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
function generateFields(stage){
    //Some biolierplate fields
    var blankFields = {
        description: stage.canonicalName,
        autoImport: "false",
        autoUpdate: "false"
    }
    //Bool to keep track of if this object contains the quantity field
    var containsQuantity = false;
    //Loop through fields of the stage schema
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
    //If no quantity field, set quantity to 1
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

    //Loop through stages of the schema
    schema.form.forEach((stage) => {
        var newStage = {};
        newStage[stage.canonicalName] = generateFields(stage);
        initialValues.form.push(newStage);
    });
    return initialValues;
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
 * Automatically generates a Yup validation schema based off the
 * billableList schema.
 * 
 * @returns {Yup.object()} formValidation
 */
function generateYupSchema(schema) {

    var blankSchema = { };
    //Loop through the stage schemas
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
 * This method synchs the auto imports to the current schema so that
 * any inputs added to the schema but not the billable will be initialized
 * @param {Object} stageSchema 
 * @param {Object} data 
 * @returns {Object} dataStage, synched stage
 */
function synchSchema(stageSchema, data){
    var dataStage = {...data};
    //Loop through fields of the schema
    stageSchema.fields.forEach((field) => {
        if(field.name !== "Name" && field.name !== "Price" && field.name !== "Quantity"){
            //Loop through the fields of the stage
            dataStage[stageSchema.canonicalName].forEach((dataField) => {
                if(dataField.inputs === undefined){
                    dataField.inputs = {};
                }
                if(dataField.inputs[field.name ===undefined]){
                    dataField.inputs[field.name] = typeSwitch(field.unit);
                }
            });
        }
    });
    return dataStage;
}

/**
 * This method changes the initial values if estimateInfo
 * has passed down pre-existing data in the form of drafts
 * or auto imports.
 * 
 * @param {JSON} initialValues the values of the form
 * @param {JSON} data estimate data passed down from estimate info
 */
function determineBillables(initialValues, data, schema) {
    var localValues = {...initialValues}
    var localData = {...data}
    //Loop through the stages of the schema
    schema.form.forEach((stage, index) => {
        //Loop through the stages of the data
        localData.form.forEach((tempStage) => {
            var dataStage = {...tempStage}
            if(dataStage !== undefined && dataStage.hasOwnProperty(stage.canonicalName)){
                localValues.form[index] = synchSchema(stage, dataStage);
            }
        })
    });
    console.log(localValues)
    return localValues;
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

    //Pull in JWT from auth context
    const {jwt} = useContext(AuthContext);

    //Set JWT header in axios
    axios.defaults.headers.common = {
        "Authorization": jwt
    }

    //Generate the yup schema
    const validationSchema = useMemo(() => generateYupSchema(props.schema), [props.schema]);
    console.log(props.data);
    //Generate the initial values
    var initialValues = useMemo(() => determineBillables(generateInitialValues(props.schema), props.data, props.schema), []);

    //Nav index for keeping track of what stage of the form the user is on
    const [navIndex, setNavIndex] = useState(0);
    //Boolean for if the estimate has been saved as a draft
    const [saved, setSaved] = useState(false);
    //Error for if submission doesn't work
    const [postError, setPostError] = useState(false);


    /**
     * Helper function to reload the page on submit
     * or save on draft
     * @param {string} status the status of the estimate
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
        const estimateData = {user: props.data.user, form: values.form, status: status, schema: props.schema};
        setPostError(false);

        if(props.data._id !== undefined){
            estimateData._id = props.data._id;
        }

        //If this has an id, we know it's a draft
        if (estimateData.hasOwnProperty("_id")) {
            //Put it to the database
            axios.put('/api/estimate?_id=' + estimateData._id.$oid, estimateData, { timeout: 12000 }).then(() => {
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
                axios.delete(`/api/user?_id=${estimateData.user._id.$oid}`, { timeout: 12000 }).then(() => {
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
                        //Stage button
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
                        {props.schema.form.map((stage, index) => (
                            (navIndex === index ?
                                (<Calculator
                                    values={values.form[index][stage.canonicalName]}
                                    path={`form[${index}][${stage.canonicalName}]`}
                                    index={index}
                                    errors={errors}
                                    touched={touched}
                                    schema={props.schema.form[index]}
                                    pID={props.schema.presetID}
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