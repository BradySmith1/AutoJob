import './../Estimator.css';
import { Formik, FieldArray, Field, Form} from 'formik';
import React, { useState } from "react";
import {array, object, string, number} from "yup";
import MaterialLibrary from './MaterialLibrary';

function MaterialCalculator(props){

    const [display, setDisplay] = useState(false);

    return(
        <FieldArray name="materials">
            {/*Here we are creating an arrow function, passing it the remove and push field
            array methods so that we can use them in the form.*/}
            {({ remove, push, insert }) => (
                <div>
                    {/*Here we are ensuring that the material array length is always greater than zero and then
                    mapping over the material array to create our resizeable form*/}
                    {props.values.materials.length > 0 &&
                    props.values.materials.map((material, index) => (
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
                                        if(props.values.materials.length > 1){
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
                        onClick={() => {
                            setDisplay(true);
                        }}
                    >
                        Import Material
                    </button>
                    {display ? <MaterialLibrary 
                                insert={insert}
                                display={display} 
                                setDisplay={setDisplay}
                                data={props.values.materials}/> : null}
                </div>
            )}
        </FieldArray>
    );
}

export default MaterialCalculator;