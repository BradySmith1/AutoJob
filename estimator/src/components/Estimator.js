import './Estimator.css'
import { Formik, FieldArray, Field, Form, ErrorMessage} from 'formik';
import React, { useState } from "react";
import * as Yup from "yup"
import axios from 'axios';

const initialValues = {
    materials: [
      {
        type: '',
        price: '',
        quantity: ''
      },
    ],
  };

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
                resetForm(initialValues);
            }}
            >
            {({ values }) => (
                <Form>
                <FieldArray name="materials">
                    {({ insert, remove, push }) => (
                    <div>
                        {values.materials.length > 0 &&
                        values.materials.map((material, index) => (
                            <div className="row" key={index}>
                            <div className="col">
                                <div className='label' htmlFor={`material.${index}.type`}>Material</div>
                                <Field
                                name={`materials.${index}.type`}
                                placeholder=""
                                type="text"
                                className="inputBox"
                                />
                                <ErrorMessage
                                name={`materials.${index}.type`}
                                component="div"
                                className="field-error"
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
                                <ErrorMessage
                                name={`materials.${index}.price`}
                                component="div"
                                className="field-error"
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
                                <ErrorMessage
                                name={`materials.${index}.price`}
                                component="div"
                                className="field-error"
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
                                onClick={() => remove(index)}
                                >
                                X
                                </button>
                            </div>
                            </div>
                        ))}
                        <button
                        type="button"
                        className="secondary"
                        onClick={() => push({ type: '', price: '', quantity: ''})}
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