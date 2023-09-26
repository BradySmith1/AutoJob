import './Estimator.css'
import { Formik, FieldArray, Field, Form, ErrorMessage} from 'formik';
import React, { useState } from "react";
import {array, object, string, number, shape} from "yup";
import axios from 'axios';

const initialValues = {
    materials: [
      {
        material_type: '',
        price: '',
        quantity: ''
      },
    ],
};

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


function Estimator(props){

    const [total, setTotal] = useState(0);
  
    return(
        <div className='materialsForm'>
            <h2>Add Materials</h2>
            <Formik
            initialValues={initialValues}
            onSubmit={async (values, {resetForm}) => {
                const customerData = JSON.parse(JSON.stringify(props.data));
                const materialData = JSON.parse(JSON.stringify(values));
                const estimateData = {...customerData, ...materialData};
                console.log(estimateData);
                axios.post('/estimate', estimateData).then(response => console.log(response))
                resetForm(initialValues);
            }}
            validationSchema={materialsValidation}
            >
            {({ values }) => (
                <Form>
                <FieldArray name="materials">
                    {({ remove, push }) => (
                    <div>
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
                                    type="text"
                                    className="inputBox"
                                    />
                                </div>
                                <div className="col">
                                    <div className='label' htmlFor={`material.${index}.quantity`}>Qty.</div>
                                    <Field
                                    name={`materials.${index}.quantity`}
                                    placeholder=""
                                    type="text"
                                    className="inputBox"
                                    />
                                </div>
                                <div className='col'>
                                    <div className='label'> Total </div>
                                    <div className='totalContainer'><div className='total'> 
                                    ${
                                        Number(material.price) * Number(material.quantity)
                                    } 
                                    </div></div>
                                </div>
                                <div className="col">
                                    <button
                                    type="button"
                                    className="secondary"
                                    onClick={() => {
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
                        <button
                        type="button"
                        className="secondary"
                        onClick={() => push({ material_type: '', price: '', quantity: ''})}
                        >
                        Add Material
                        </button>
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