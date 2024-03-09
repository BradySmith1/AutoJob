import React from "react";
import { FieldArray, Field } from "formik";
import Seperator from "../utilComponents/Seperator";
import "./Fields.css"
import Editable from "../utilComponents/Editable";
import Close from "../../assets/Close.png"
import Up from "../../assets/Up.png"
import Down from "../../assets/Down.png"
import lightEdit from "../../assets/LightEdit.png";
import Locked from "../../assets/Locked.png";

const units = [
    // Others
    { value: "Number", label: "Number" }, // Just a number
    { value: "Text", label: "Text" }, // Just text
];

const fieldSchema = {
    name: "Name",
    unit: "Text",
    showInOverview: true
}

function Fields(props){
    return(
        <div className="FieldsWrapper">
            <Editable path={lightEdit}>
                <Field className="CanonicalNameTitle NoInputStyle Black" name={`form[${props.index}].canonicalName`} />
            </Editable>
            <Seperator borderColor="white" />
            <FieldArray name={props.path}>
                {({remove, push, insert }) => (
                    <div>
                        {props.formValues.form[props.index].fields.length > 0 && 
                         props.formValues.form[props.index].fields.map((element, index) => (
                            <div className="FieldsContainer">
                                {element.required === undefined ? (
                                    <>
                                        <Editable path={lightEdit}>
                                            <Field className="Name NoInputStyle Black" name={`form[${props.index}].fields[${index}].name`} />
                                        </Editable>
                                        <Field className="Unit" as="select" name={`form[${props.index}].fields[${index}].unit`}>
                                            {units.map((unit) => (
                                                <option value={`${unit.value}`}>{unit.label}</option>
                                            ))}
                                        </Field>
                                        <div className="BinaryContainer">
                                            <Field className="showInOverview" type="checkbox" name={`form[${props.index}].fields[${index}].showInOverview`} />
                                            <p>Show In Overview</p>
                                        </div>
                                        <button className="RemoveFieldButton" onClick={() => {
                                            remove(index);
                                        }}>
                                            Remove
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Editable path={Locked}>
                                            <div className="Name FakeField">
                                                {element.name}
                                            </div>
                                        </Editable>
                                        <select className="Unit">
                                            <option values={element.unit}>{element.unit}</option>
                                        </select>
                                        <div className="BinaryContainer">
                                            <input type="checkbox" checked="checked" onclick="return false;"/> 
                                            <p>Show In Overview</p>
                                        </div>
                                        <button className="RemoveFieldButton" onClick={() => {

                                        }}>
                                            Locked
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                        <div className="AddButtonWrapper">
                            <button
                                type="button"
                                className="button medium"
                                onClick={() => push(fieldSchema)}
                                >
                                + Add New Field
                            </button>
                        </div>
                    </div>
                )}
            </FieldArray>
            {props.formValues.form.length > 1 ? (
                <img src={Close} className="RemoveStage" onClick={() => {
                    props.remove(props.index);
                }}/>
            ) : (
                null
            )}

            {props.index > 0 ? (
                <img src={Up} className="Up Arrow" onClick={() => {
                        props.move(props.index, props.index - 1);
                }}/>
            ) : (
                null
            )}

            {props.index < props.formValues.form.length - 1 ? (
                <img src={Down} className="Down Arrow" onClick={() => {
                    props.move(props.index, props.index + 1);
                }}/>
            ) : (
                null
            )}


        </div>
    )
}

export default Fields;