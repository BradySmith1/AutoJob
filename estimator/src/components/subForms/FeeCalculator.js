import './FeeCalculator.css';
import { FieldArray, Field} from 'formik';
import React, { useState } from "react";
import FeeLibrary from './FeeLibrary.js';

function FeeCalculator(props){

    const [display, setDisplay] = useState(false);

    return(
        <FieldArray name="fees">
            {/*Here we are creating an arrow function, passing it the remove and push field
            array methods so that we can use them in the form.*/}
            {({ remove, push, insert }) => (
                <div className='wrapper'>
                    <h2>Add Fees</h2>
                    {/*Here we are ensuring that the material array length is always greater than zero and then
                    mapping over the material array to create our resizeable form*/}
                    {props.values.fees.length > 0 &&
                    props.values.fees.map((fee, index) => (
                        <div className="row" key={index}>
                            <div className="col">
                                <div className='label' htmlFor={`fee.${index}.fee_title`}>Fee Title</div>
                                <Field
                                name={`fees.${index}.fee_title`}
                                placeholder=""
                                type="text"
                                className="inputBox"
                                />
                            </div>
                            <div className="col">
                                <div className='label' htmlFor={`fee.${index}.price`}>Price</div>
                                <Field
                                name={`fees.${index}.price`}
                                placeholder=""
                                type="number"
                                className="inputBox"
                                />
                            </div>
                            <div className="col">
                                <div className='label' htmlFor={`fee.${index}.quantity`}>Qty.</div>
                                <Field
                                name={`fees.${index}.quantity`}
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
                                        fee.price * fee.quantity
                                    } 
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <button
                                    type="button"
                                    className="xButton"
                                    onClick={() => {
                                        //Here we are removing this element of the material array
                                        //when the x button is clicked
                                        if(props.values.fees.length > 1){
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
                        onClick={() => push({ fee_title: '', price: 0.0, quantity: 0.0})}
                    >
                        Add Fee
                    </button>
                    <button
                        type="button"
                        className="secondary"
                        onClick={() => {
                            setDisplay(true);
                        }}
                    >
                        Import Fee
                    </button>
                    {display ? <FeeLibrary 
                                insert={insert}
                                display={display} 
                                setDisplay={setDisplay}
                                data={props.values.fees}/> : null}
                </div>
            )}
        </FieldArray>
    );
}

export default FeeCalculator;