/**
 * @version 1, Octover 12th, 2023
 * @author Andrew Monroe 
 * @author Brady Smith
 * 
 * This component uses a field array to display a resizable form so
 * that you can enter as many materials/fees as you want.
 */

import './Calculator.css';
import { FieldArray, Field, ErrorMessage} from 'formik';
import React, { useContext, useState } from "react";
import Library from './Library';
import billableList from '../../JSONs/billableList.json';
import CalcColumn from './CalcColumn';

/**
 * This method returns the calculator component. It is a
 * resizable form of some type, that could be either material
 * or fees.
 * 
 * @param {Json Object} props
 *      props.values the values of the form
 *      props.name the name of the form
 *      props.errors any errors that may exist in the form
 *      props.touched Kepps track of any input fields that have been touched
 * @returns  JSX object containing all html for the Form
 */
function Calculator(props){

    const billableSchema = {
        name: "",
        price: 0.0,
        quantity: 1,
        description: props.name,
        autoImport: "false",
        autoUpdate: "false"
    }

    //Use state used to keep track of if the material libaray should be displayed or not.
    const [display, setDisplay] = useState(false);
    //Formik name, derrived from the props.name, used to name input fields
    const formikName = billableList[props.name];

    // console.log(props.path)
    // console.log(props.values)

    return(
        <FieldArray name={props.path}>
            {/*Here we are creating an arrow function, passing it the remove and push field
            array methods so that we can use them in the form.*/}
            {({ remove, push, insert, index }) => (
                <div className='wrapper' id={index}>
                    <h2>Add {props.schema.canonicalName}</h2>
                    {/*Here we are ensuring that the billable array length is always greater than zero and then
                    mapping over the billable array to create our resizeable form*/}
                    {props.values.length > 0 &&
                    props.values.map((value, billableIndex) => (
                        <div className="row" key={index}>
                            {props.schema.fields.map((field, index) => (
                                <CalcColumn key={index} path={`${props.path}[${billableIndex}][${field.name}]`} values={value} schema={props.schema.fields[index]}/>
                            ))}
                            {/** Input field for the name of the billable object, and a dive to display errors */}
                            {/* <div className="col">
                                <div className='label' >{props.name}</div>
                                <Field
                                name={`${formikName}.${index}.name`}
                                placeholder=""
                                type="text"
                                className="inputBox"
                                />
                                <div className='errors'><ErrorMessage name={`${formikName}.${index}.name`} component='div'/></div>
                            </div> */}
                            {/** Input field for the price of the billable object, and a dive to display errors */}
                            {/* <div className="col">
                                <div className='label' >Price</div>
                                <Field
                                name={`${formikName}.${index}.price`}
                                placeholder=""
                                type="number"
                                className="inputBox"
                                />
                                <div className='errors'><ErrorMessage name={`${formikName}.${index}.price`} component='div'/></div>
                            </div> */}
                            {/** Input field for the quantity of the billable object, and a dive to display errors */}
                            {/* <div className="col">
                                <div className='label' >Qty.</div>
                                <Field
                                name={`${formikName}.${index}.quantity`}
                                placeholder=""
                                type="number"
                                className="inputBox"
                                />
                                <div className='errors'><ErrorMessage name={`${formikName}.${index}.quantity`} component='div'/></div>
                            </div> */}
                            {/**This displays the subtotal for the column */}
                            <div className='col totalCol'>
                                <div className='label'> Sub Total </div>
                                <div className='totalContainer'>
                                    <div className='total'> 
                                    {/*Here we are calculating the total price for this billable*/}
                                    ${
                                        (props.values[billableIndex].Price * props.values[billableIndex].Quantity).toFixed(2)
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
                        className="button medium"
                        onClick={() => push(billableSchema)}
                    >
                        + Add New {props.name}
                    </button>
                    {/**In this click function, we are setting display to true so that we can display the material library */}
                    <button
                        type="button"
                        className="button medium"
                        onClick={() => {
                            setDisplay(true);
                        }}
                    >
                        + Import {props.name}
                    </button>
                    {/**If display is true, display the material library */}
                    {display ? <Library 
                                insert={insert}
                                setDisplay={setDisplay}
                                data={props.values}
                                name={props.name}/> : null}
                </div>
            )}
        </FieldArray>
    );
}

export default Calculator;