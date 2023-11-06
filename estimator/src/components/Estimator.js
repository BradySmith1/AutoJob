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

//Declare initial values for the form, an array of material objects
//and an array of fee objects
const billableSchema = [{
    name: '',
    price: 0.0,
    quantity: 1.0,
    description: ''
}]

const initialValues = {
    materials: [...billableSchema],
    fees: [...billableSchema]
};

//Declare a validation schema for the form
const materialsValidation = Yup.object().shape({
    materials: Yup.array(Yup.object().shape({
        name: Yup.string()
            .required('Required')
            .max(20, "Must be less than 20 characters"),

        price: Yup.number('Must be a number')
            .required('Required'),

        quantity: Yup.number('Must be a number')
            .required('Required')

    })).min(1),
    fees: Yup.array(Yup.object().shape({
        name: Yup.string()
            .required('Required')
            .max(20, "Must be less than 20 characters"),

        price: Yup.number('Must be a number')
            .required('Required'),

        quantity: Yup.number('Must be a number')
            .required('Required')

    })).min(1)
    
});

function constructData(userData, materials, fees, status){
    const customerData = JSON.parse(JSON.stringify(userData));
    const materialData = JSON.parse(JSON.stringify(materials));
    const materialArr = {materials: materialData};
    const feeData = JSON.parse(JSON.stringify(fees));
    const feeArr = {fees: feeData}

    //Merge the JSONs into one
    const estimateData = {...customerData, ...materialArr, ...feeArr, status: status};

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
function Estimator(props){

    //Nav index for keeping track of what stage of the form the user is on
    const [navIndex, setNavIndex] = useState(0);
    const [saved, setSaved] = useState(false);

    for(const key of Object.keys(initialValues)){
        if(props.data.hasOwnProperty(key)){
            initialValues[key] = props.data[key];
        }else{
            initialValues[key] = [...billableSchema];
        }
    }

    const postDraftData = (materialArr, feeArr, status) => {

        const estimateData = constructData(props.data, materialArr, feeArr, status);

        console.log(estimateData);

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
                axios.delete(`/user/${estimateData.user._id.$oid}`).then((response) => {
                    console.log(response);
                    if(status === "complete"){
                        window.location.reload(false);
                    }
                });
            });
        }
        //axios.delete(`/user/${props.data._id.$oid}`).then(response => console.log(response));
    }

    return(
        <div className='materialsForm'>
            <div className='divider'>
                <h2>Three Stage Estimate Calculator</h2>
                <div className='formNav'>
                    <button className='button'
                            onClick={() => {setNavIndex(0)}}>
                        Materials
                    </button>
                    <button className='button'
                            onClick={() => {setNavIndex(1)}}>
                        Fees
                    </button>
                    <button className='button'
                            onClick={() => {setNavIndex(2)}}>
                        Overview
                    </button>
                </div>
            </div>

            <Formik
            initialValues={initialValues}
            validationSchema={materialsValidation}
            validateOnChange={false}
            validateOnBlur={true}
            onSubmit={(values) => postDraftData(values.materials, values.fees, "complete")}
            >
            {/*Here we are creating an arrow function that returns the form and passing it
            our form values*/}
                {({ values, errors, touched }) => (
                    <Form>
                        {/**Material calculator */}
                        {navIndex === 0 ? <Calculator 
                                            values={values.materials} 
                                            name="Material" 
                                            errors={errors} 
                                            touched={touched} /> 
                                        : 
                                        null
                        }
                        {/**Fee calculator */}
                        {navIndex === 1 ? <Calculator 
                                            values={values.fees} 
                                            name="Fee" 
                                            errors={errors} 
                                            touched={touched} /> 
                                        : 
                                        null
                        }
                        {/**Overview */}
                        {navIndex === 2 ? <Overview values={values} /> : null}
                        {/**Display an error message if there are errors in the form */}
                        {navIndex === 2 && (errors.fees || errors.materials) ? <div className='center invalid'>Input Errros Prevent Submission</div> : null}
                        {navIndex === 2 && saved ? <div className='center'>Saved as Draft</div> : null}
                        {/**Only display the submit button if ther are in the overview stage */}
                        {navIndex === 2 ? <button type="submit">Submit Estimate</button> : null}
                        {navIndex === 2 ? <button type="button" onClick={() => {
                            postDraftData(values.materials, values.fees, "draft");
                            setSaved(true);
                        }}>
                                            Save as draft
                                          </button> : null}
                    </Form>
                )}
            </Formik>
        </div>
);
}

export default Estimator;