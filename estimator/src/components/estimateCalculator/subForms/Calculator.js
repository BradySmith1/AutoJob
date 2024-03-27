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
import React, { useContext, useMemo, useState } from "react";
import Library from './Library';
import billableList from '../../JSONs/billableList.json';
import CalcColumn from './CalcColumn';


function displayCalcColumn(field, schemaIndex, props, billableIndex){
    var jsxObject = (null);
    if(field.name === "Name"){
        jsxObject = (<CalcColumn key={schemaIndex} path={`${props.path}[${billableIndex}].name`} schema={props.schema.fields[schemaIndex]}/>)
    }else if(field.name === "Price"){
        jsxObject = (<CalcColumn key={schemaIndex} path={`${props.path}[${billableIndex}].price`} schema={props.schema.fields[schemaIndex]}/>)
    }else if(field.name === "Quantity"){
        jsxObject = (<CalcColumn key={schemaIndex} path={`${props.path}[${billableIndex}].quantity`} schema={props.schema.fields[schemaIndex]}/>)
    }else{
        jsxObject = (<CalcColumn key={schemaIndex} path={`${props.path}[${billableIndex}].inputs[${field.name}]`} schema={props.schema.fields[schemaIndex]}/>);
    }   
    return jsxObject;
}

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

    //Use state used to keep track of if the material libaray should be displayed or not.
    const [display, setDisplay] = useState(false);
    //Formik name, derrived from the props.name, used to name input fields

    const [defaultBillable] = useMemo((() => props.generateFields(props.schema)), [props.schema])

    console.log(props.generateFields(props.schema))

    // console.log(props.path)
    // console.log(props.values)

    return(
        <FieldArray name={props.path}>
            {/*Here we are creating an arrow function, passing it the remove and push field
            array methods so that we can use them in the form.*/}
            {({ remove, push, insert, index }) => (
                <div className='wrapper' id={index}>
                    <h2>{props.schema.canonicalName} Stage</h2>
                    {/*Here we are ensuring that the billable array length is always greater than zero and then
                    mapping over the billable array to create our resizeable form*/}
                    {props.values.length > 0 &&
                    props.values.map((value, billableIndex) => (
                        <div className="row" key={index}>
                            <div className='fieldsContainer'>
                                {props.schema.fields.map((field, schemaIndex) => (
                                    displayCalcColumn(field, schemaIndex, props, billableIndex)
                                ))}
                            </div>
                            {/**This displays the subtotal for the column */}
                            <div className='col'>
                                <div className='label'> Sub Total </div>
                                <div className='totalContainer'>
                                    <div className='total'> 
                                    {/*Here we are calculating the total price for this billable*/}
                                    ${
                                        (props.values[billableIndex].price * props.values[billableIndex].quantity).toFixed(2)
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
                                            remove(billableIndex)
                                        }
                                    }}
                                >
                                    X
                                </button>
                            </div>
                        </div>
                    ))}
                    {/*In this on click fuction, we are pushing a new empty billable to the array*/}
                    <div className='AddImportWrapper'>
                        <button
                            type="button"
                            className="button medium"
                            onClick={() => push(defaultBillable)}
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
                    </div>
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