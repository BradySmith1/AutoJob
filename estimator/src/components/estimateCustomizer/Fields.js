import React from "react";
import { FieldArray, Field } from "formik";
import Seperator from "../utilComponents/Seperator";

const units = [
    // Others
    { value: "Number", label: "Number" }, // Just a number
    { value: "Text", label: "Text" }, // Just text
    { value: "Currency", label: "Currency"}

];

const fieldSchema = {
    name: "Name",
    unit: "Text",
    showInOverview: true
}

function Fields(props){
    return(
        <>
            <Field className="canonicalNameTitle" name={`form[${props.index}].canonicalName`} />
            <Seperator borderColor="white" />
            <FieldArray name={props.path}>
                {({remove, push, insert}) => (
                    <div>
                        {props.formValues.form[props.index].fields.length > 0 && 
                         props.formValues.form[props.index].fields.map((element, index) => (
                            <>
                                <Field className="Name" name={`form[${props.index}].fields[${index}].name`} />
                                <Field className="Unit" as="select" name={`form[${props.index}].fields[${index}].unit`}>
                                    {units.map((unit) => (
                                        <option value={`${unit.value}`}>{unit.label}</option>
                                    ))}
                                </Field>
                                <Field className="showInOverview" type="checkbox" name={`form[${props.index}].fields[${index}].showInOverview`} />
                                <p>Show In Overview</p>
                            </>
                        ))}
                        <button
                            type="button"
                            className="button medium"
                            onClick={() => push(fieldSchema)}
                            >
                            + Add New Field
                        </button>
                    </div>
                )}
            </FieldArray>
        </>
    )
}

export default Fields;