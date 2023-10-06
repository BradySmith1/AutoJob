/**
 * @version 1, September 28th, 2023
 * @author Andrew Monroe and Brady Smith
 * 
 * This component uses a field array to display a resizable form so
 * that you can enter as many surfaces as you want.
 */
import './Estimator.css';
import { Formik, FieldArray, Field, Form} from 'formik';
import React, { useState } from "react";
import {array, object, string, number} from "yup";
import axios from 'axios';
import MaterialLibrary from './MaterialLibrary';

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
                    <FieldArray name="materials">
                        {/*Here we are creating an arrow function, passing it the remove and push field
                        array methods so that we can use them in the form.*/}
                        {({ remove, push, insert }) => (
                            <div>
                                {/*Here we are ensuring that the material array length is always greater than zero and then
                                mapping over the material array to create our resizeable form*/}
                                {values.materials.length > 0 &&
                                values.materials.map((material, index) => (
                                    <div className="row" key={index}>
                                        <div className="col">
                                            <div className='label' htmlFor={`material.${index}.material_type`}>Material</div>
                                            <Field
                                            name={`materials.${index}.material_type`}
                                            placeholder=""
                                            type="text"
                                            className="inputBox"
                                            />
                                        </div>
                                        <div className="col">
                                            <div className='label' htmlFor={`material.${index}.price`}>Price</div>
                                            <Field
                                            name={`materials.${index}.price`}
                                            placeholder=""
                                            type="number"
                                            className="inputBox"
                                            />
                                        </div>
                                        <div className="col">
                                            <div className='label' htmlFor={`material.${index}.quantity`}>Qty.</div>
                                            <Field
                                            name={`materials.${index}.quantity`}
                                            placeholder=""
                                            type="number"
                                            className="inputBox"
                                            />
                                        </div>
                                        <div className='col'>
                                            <div className='label'> Sub Total </div>
                                            <div className='totalContainer'>
                                                <div className='total'> 
                                                {/*Here we are calculating the total price for this material*/}
                                                ${
                                                    material.price * material.quantity
                                                } 
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col">
                                            <button
                                                type="button"
                                                className="secondary"
                                                onClick={() => {
                                                    //Here we are removing this element of the material array
                                                    //when the x button is clicked
                                                    if(values.materials.length > 1){
                                                        remove(index)
                                                    }
                                                }}
                                            >
                                                X
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {/*In this on click fuction, we are pushing a new empty material to the array*/}
                                <button
                                    type="button"
                                    className="secondary"
                                    onClick={() => push({ material_type: '', price: 0.0, quantity: 0.0})}
                                >
                                    Add Material
                                </button>
                                <button
                                    type="button"
                                    className="secondary"
                                    onClick={() => setDisplay(true)}
                                >
                                    Import Material
                                </button>
                                {display ? <MaterialLibrary 
                                            insert={insert}
                                            display={display} 
                                            setDisplay={setDisplay}/> : null}
                            </div>
                        )}
                    </FieldArray>
                <button type="submit">Submit Estimate</button>
                </Form>
            )}
            </Formik>
        </div>
);
}

export default Estimator;