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
import billableList from './JSONs/billableList.json'

//Declare initial values for the form, an array of material objects
//and an array of fee objects
const billableSchema = [{
    name: '',
    price: 0.0,
    quantity: 1.0,
    description: '',
    auto_update: "false"
}]

function determineErrors(errors){
    var bool = false;
    for(const key of Object.keys(billableList)){
        if(errors[billableList[key]]){
            bool = true;
        }
    }
    return bool;
}

function generateInitialValues(){
    var initialValues = {};
    for(const key of Object.keys(billableList)){
        initialValues[billableList[key]] = [...billableSchema];
    }
    console.log(initialValues)
    return initialValues;
}

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

function determineBillables(initialValues, data){
    for(const key of Object.keys(initialValues)){
        if(data.hasOwnProperty(key)){
            initialValues[key] = data[key];
        }
    }
}

function constructData(user, billables, status){
    var estimateData = {...user};
    for(const key of Object.keys(billableList)){
        var billableArr = {};
        billableArr[billableList[key]] = [...billables[billableList[key]]];
        estimateData = {...estimateData, ...billableArr}
    }
    //Merge the JSONs into one
    estimateData = {...estimateData, status: status};

    return estimateData;
}

const validationSchema = generateYupSchema();
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

    determineBillables(initialValues, props.data);

    const postDraftData = (values, status) => {
        const estimateData = constructData(props.data, values, status);

        if(estimateData.hasOwnProperty("_id")){
            axios.put('/estimate/'+ props.data._id.$oid, estimateData).then((response) => {
                console.log(response);
                if(status === "complete"){
                    window.location.reload(false);
                }
            });
        }else{
            axios.post('/estimate', estimateData).then((response) => {
                console.log(response);
                if(status === "complete"){
                    axios.delete(`/user?_id=${estimateData.user._id.$oid}`).then((response) => {
                        console.log(response);
                        window.location.reload(false);
                    });
                }
            });
        }
    }

    return(
        <div className='materialsForm'>
            <div className='divider'>
                <h2>Three Stage Estimate Calculator</h2>
                <div className='formNav'>
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
                        {Object.keys(billableList).map((key, index) => (
                            (navIndex === index ? 
                            (
                                <Calculator 
                                    values={values[billableList[key]]} 
                                    name={key} 
                                    errors={errors} 
                                    touched={touched} 
                                />            
                            )
                            : 
                            (null)
                            )
                        ))
                        }
                        {navIndex === Object.keys(billableList).length ? 
                        (
                            <>
                                <Overview values={values} />
                                {(determineErrors(errors)) ? <div className='center invalid'>Input Errros Prevent Submission</div> : null}
                                {saved ? <div className='center'>Saved as Draft</div> : null}
                                <button type="submit">Submit Estimate</button>
                                <button type="button" onClick={() => {
                                    postDraftData(values, "draft");
                                    setSaved(true);
                                }}>Save as Draft</button>
                            </>
                        )
                        :
                        (
                            null
                        )
                        }
                    </Form>
                )}
            </Formik>
        </div>
);
}

export default Estimator;