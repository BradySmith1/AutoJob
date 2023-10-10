import './Calculator.css';
import { FieldArray, Field} from 'formik';
import React, { useState } from "react";
import Library from './Library';

function Calculator(props){

    const [display, setDisplay] = useState(false);
    const formikName = (props.name + "s").toLowerCase();

    return(
        <FieldArray name={(formikName).toLowerCase()}>
            {/*Here we are creating an arrow function, passing it the remove and push field
            array methods so that we can use them in the form.*/}
            {({ remove, push, insert }) => (
                <div className='wrapper'>
                    <h2>Add {props.name}s</h2>
                    {/*Here we are ensuring that the billable array length is always greater than zero and then
                    mapping over the billable array to create our resizeable form*/}
                    {props.values.length > 0 &&
                    props.values.map((billable, index) => (
                        <div className="row" key={index}>
                            <div className="col">
                                <div className='label' >{props.name}</div>
                                <Field
                                name={`${formikName}.${index}.name`}
                                placeholder=""
                                type="text"
                                className="inputBox"
                                />
                            </div>
                            <div className="col">
                                <div className='label' >Price</div>
                                <Field
                                name={`${formikName}.${index}.price`}
                                placeholder=""
                                type="number"
                                className="inputBox"
                                />
                            </div>
                            <div className="col">
                                <div className='label' >Qty.</div>
                                <Field
                                name={`${formikName}.${index}.quantity`}
                                placeholder=""
                                type="number"
                                className="inputBox"
                                />
                            </div>
                            <div className='col'>
                                <div className='label'> Sub Total </div>
                                <div className='totalContainer'>
                                    <div className='total'> 
                                    {/*Here we are calculating the total price for this billable*/}
                                    ${
                                        billable.price * billable.quantity
                                    } 
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <button
                                    type="button"
                                    className="xButton"
                                    onClick={() => {
                                        //Here we are removing this element of the billable array
                                        //when the x button is clicked
                                        if(props.values.length > 1){
                                            remove(index)
                                        }
                                    }}
                                >
                                    X
                                </button>
                            </div>
                        </div>
                    ))}
                    {/*In this on click fuction, we are pushing a new empty billable to the array*/}
                    <button
                        type="button"
                        className="secondary"
                        onClick={() => push({ name: '', price: 0.0, quantity: 0.0, description: props.name})}
                    >
                        Add {props.name}
                    </button>
                    <button
                        type="button"
                        className="secondary"
                        onClick={() => {
                            setDisplay(true);
                        }}
                    >
                        Import {props.name}
                    </button>
                    {display ? <Library 
                                insert={insert}
                                display={display} 
                                setDisplay={setDisplay}
                                data={props.values}
                                name={props.name}/> : null}
                </div>
            )}
        </FieldArray>
    );
}

export default Calculator;