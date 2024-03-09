import React from "react";
import Seperator from "../utilComponents/Seperator";
import { Formik, Field, Form, yupToFormErrors, FieldArray } from 'formik';
import * as Yup from "yup";
import Fields from "./Fields";
import "./Preset.css";
import Editable from "../utilComponents/Editable";
import lightEdit from "../../assets/LightEdit.png";

const validationSchema = Yup.object().shape({
    estimateType: Yup.string()
        .required('Required')
        .max(20, "Must be less than 20 characters"),
    form: Yup.array(Yup.object().shape({
        canonicalName: Yup.string()
            .required('Required')
            .max(20, "Must be less than 20 characters"),
        fields: Yup.array(Yup.object().shape({
            name: Yup.string()
                .required('Required')
                .max(20, "Must be less than 20 characters"),
            unit: Yup.string()
                .required('Required'),
            showInOverview: Yup.boolean()
                .required('Required')
        }))
    }))
});

const defaultStage = {
    canonicalName: "Default Name",
    fields: [
        {
            name: "Name",
            unit: "Text",
            showInOverview: true,
            required: true
        },
        {
            name: "Price",
            unit: "Number",
            showInOverview: true,
            required: true
        },
        {
            name: "Quantity",
            unit: "Number",
            showInOverview: true
        }
    ]
}

const submit = (values, props) => {
    props.setSchema(values, props.index);
}


function Preset(props){
    return(
        <div className="PresetWrapper">
            <Formik
                initialValues={{...props.preset}}
                onSubmit={(values) => {
                    submit(values, props);
                }}
                validationSchema={validationSchema}
            >
                {({values}) => (
                <Form>
                    <Editable path={lightEdit}>
                        <Field className="EstimateTypeTitle NoInputStyle" id="estimateType" name="estimateType" />
                    </Editable>
                    <Seperator borderColor="white" />
                    <FieldArray name="form">
                        {({remove, push, move}) => (
                            <div className="InnerFieldArray">
                                {values.form.length > 0 && values.form.map((value, index) => (
                                    <Fields path={`form[${index}].fields`} formValues={values} index={index} remove={remove} move={move}/>
                                ))}
                                <div className="AddButtonWrapper">
                                    <button
                                        type="button"
                                        className="button medium"
                                        onClick={() => push(defaultStage)}
                                        >
                                        + Add New Stage
                                    </button>
                                </div>
                            </div>
                        )}
                    </FieldArray>
                    <button type="submit" className='button large'>Save</button>
                </Form>
                )}
            </Formik>
        </div>
    );
}

export default Preset;