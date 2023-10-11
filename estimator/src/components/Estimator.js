/**
 * @version 1, September 28th, 2023
 * @author Andrew Monroe and Brady Smith
 * 
 * This component uses a field array to display a resizable form so
 * that you can enter as many surfaces as you want.
 */
import './Estimator.css';
import { Formik, Form} from 'formik';
import React, { useState, useEffect } from "react";
import * as Yup from "yup"
import axios from 'axios';
import Calculator from './subForms/Calculator.js';
import Overview from './subForms/Overview.js';

//Declare initial values for the form, an array of material objects
const initialValues = {
    materials: [
        {
            name: '',
            price: 0.0,
            quantity: 0.0,
            description: ''
        },
    ],
    fees: [
        {
            name: '',
            price: 0.0,
            quantity: 0.0,
            description: ''
        }
    ]
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

/**
 * This function returns all the html and javascript for the resizeable form.
 * 
 * @param {Json Object} props, the selected data from EstimateInfo 
 * @returns JSX object containing all html for the Form
 */
function Estimator(props){

    useEffect(() => {
        
    }, [props.data]);

    const [navIndex, setNavIndex] = useState(0);

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
            onSubmit={async (values, {resetForm}) => {
                //Submit Function

                //Turn customer data and material data into raw JSONs
                const customerData = JSON.parse(JSON.stringify(props.data));
                const user = {user: customerData};
                const materialData = JSON.parse(JSON.stringify(values.materials));
                const materials = {materials: materialData};
                const feeData = JSON.parse(JSON.stringify(values.fees));
                const fees = {fees: feeData}

                //Merge the two JSONs into one
                const estimateData = {...user, ...materials, ...fees};

                //Post the json to our backend
                axios.post('/estimate', estimateData).then(response => console.log(response));
                //Delete the customer info entry from the userEstimates database
                axios.delete(`/user/${props.data._id.$oid}`).then(response => console.log(response));
                resetForm()
                window.location.reload(false);
                //reset the form to it's initial values

                //resetForm(initialValues);
            }}
            >
            {/*Here we are creating an arrow function that returns the form and passing it
            our form values*/}
                {({ values, errors, touched }) => (
                    <Form>
                        {navIndex === 0 ? <Calculator values={values.materials} name="Material" errors={errors} touched={touched} /> : null}
                        {navIndex === 1 ? <Calculator values={values.fees} name="Fee" errors={errors} touched={touched} /> : null}
                        {navIndex === 2 ? <Overview values={values} /> : null}
                        {navIndex === 2 && (errors.fees || errors.materials) ? <div className='center'>Input Errros Prevent Submission</div> : null}
                        {navIndex === 2 ? <button type="submit">Submit Estimate</button> : null}
                    </Form>
                )}
            </Formik>
        </div>
);
}

export default Estimator;