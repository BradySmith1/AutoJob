/**
 * @version 1, September 28th, 2023
 * @author Andrew Monroe and Brady Smith
 * 
 * This component uses a field array to display a resizable form so
 * that you can enter as many surfaces as you want.
 */
import './Estimator.css';
import './subForms/MaterialCalculator.js';
import { Formik, FieldArray, Field, Form} from 'formik';
import React, { useState } from "react";
import {array, object, string, number} from "yup";
import axios from 'axios';
import MaterialCalculator from './subForms/MaterialCalculator.js';

//Declare initial values for the form, an array of material objects
const initialValues = {
    materials: [
      {
        material_type: '',
        price: 0.0,
        quantity: 0.0
      },
    ],
};

//Declare a validation schema for the form
const materialsValidation = object({
    materials: array(object({
        material_type: string()
            .required('Required')
            .max(20, "Must be less than 20 characters"),

        price: number('Must be a number')
            .required('Required'),

        quantity: number('Must be a number')
            .required('Required')

    })).min(1)
});

/**
 * This function returns all the html and javascript for the resizeable form.
 * 
 * @param {Json Object} props, the selected data from EstimateInfo 
 * @returns JSX object containing all html for the Form
 */
function Estimator(props){

    const [display, setDisplay] = useState(false);

    return(
        <div className='materialsForm'>
            <h2>Add Materials</h2>
            <Formik
            initialValues={initialValues}
            onSubmit={async (values, {resetForm}) => {
                //Submit Function

                //Turn customer data and material data into raw JSONs
                const customerData = JSON.parse(JSON.stringify(props.data));
                const user = {user: customerData}
                const materialData = JSON.parse(JSON.stringify(values));

                //Merge the two JSONs into one
                const estimateData = {...user, ...materialData};

                console.log(estimateData);

                //Post the json to our backend
                axios.post('/estimate', estimateData).then(response => console.log(response));
                //Delete the customer info entry from the userEstimates database
                axios.delete(`/user/${props.data._id.$oid}`).then(response => console.log(response));
                //reset the form to it's initial values
                resetForm(initialValues);
            }}
            validationSchema={materialsValidation}
            >
            {/*Here we are creating an arrow function that returns the form and passing it
            our form values*/}
            {({ values }) => (
                <Form>
                    <MaterialCalculator values={values} />
                    <button type="submit">Submit Estimate</button>
                </Form>
            )}
            </Formik>
        </div>
);
}

export default Estimator;