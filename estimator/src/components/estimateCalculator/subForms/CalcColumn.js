/**
 * @version 1, March 18th, 2024
 * @author Andrew Monroe 
 * @author Brady Smith
 * 
 * This component is used for displaying a field in the calculator
 */
import React, { useContext } from "react";
import { Field, ErrorMessage} from 'formik';

/**
 * Returns an input field for the estimate calculator
 * @param {*} props 
 * @returns 
 */
function CalcColumn(props){
    console.log(props.schema)
    return(
        <div className='col'>
            <div className='label' >{props.schema.name}</div>
                <Field
                    name={props.path}
                    placeholder=""
                    type={props.schema.unit.toLowerCase()}
                    className="inputBox"
                />
            <div className='errors'><ErrorMessage name={`${props.path}`} component='div'/></div>
        </div>
    );
}

export default CalcColumn;