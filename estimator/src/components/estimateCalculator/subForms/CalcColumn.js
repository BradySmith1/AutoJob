import React, { useContext } from "react";
import { Field, ErrorMessage} from 'formik';

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