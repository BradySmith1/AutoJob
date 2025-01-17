import React from "react";
import Seperator from "../utilComponents/Seperator";
import { Formik, Field, Form, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import Fields from "./Fields";
import "./Preset.css";
import Editable from "../utilComponents/Editable";
import lightEdit from "../../assets/LightEdit.png";
import defaultSchema from "../JSONs/defaultEstimate.json";

/**
 * This method ensures that names of stages in the customizer
 * are unique.
 *
 * Taken from pbelaustegui on github.com
 * https://github.com/jquense/yup/issues/345
 */
Yup.addMethod(Yup.array, "unique", function (message, mapper = (a) => a) {
  return this.test("unique", message, function (list) {
    return list.length === new Set(list.map(mapper)).size;
  });
});

//Yup schema
const validationSchema = Yup.object().shape({
  estimateType: Yup.string()
    .required("Required")
    .max(20, "Must be less than 20 characters"),
  form: Yup.array(
    Yup.object().shape({
      canonicalName: Yup.string()
        .required("Required")
        .max(20, "Must be less than 20 characters"),
      fields: Yup.array(
        Yup.object().shape({
          name: Yup.string()
            .required("Required")
            .max(20, "Must be less than 20 characters"),
          unit: Yup.string().required("Required"),
          showInOverview: Yup.boolean().required("Required"),
        })
      ).unique("Duplicate names", (a) => a.name),
    })
  ).unique("Duplicate names", (a) => a.canonicalName),
});

//Default stage taken from default schema JSON
const defaultStage = { ...defaultSchema.form[0] };
//Default name for a stage
defaultStage.canonicalName = "Default";

/**
 * The submit function of the estimate customizer
 *
 * @param {Object} values, values from the Formik Form
 * @param {Object} props, the schema being modified
 */
const submit = (values, props) => {
  props.setSchema(values, props.index);
};

/**
 * This function maps over stages in the current schema passed from the chosen
 * preset and displays them in the modal window.
 *
 * @param {Object} props, values passed from preset
 * @returns JSX element
 */
function Preset(props) {
  return (
    <div className="PresetWrapper">
      {/*Form settings*/}
      <Formik
        initialValues={{ ...props.preset }}
        onSubmit={(values) => {
          submit(values, props);
        }}
        validationSchema={validationSchema}
      >
        {({ values }) => (
          <Form>
            {/*Preset name inpute field */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <Editable path={lightEdit}>
                <Field
                  className="EstimateTypeTitle NoInputStyle"
                  id="estimateType"
                  name="estimateType"
                />
              </Editable>
              <div className="errors" style={{ marginLeft: "0px" }}>
                <ErrorMessage name={`estimateType`} component="div" />
              </div>
            </div>
            <Seperator borderColor="white" />
            <FieldArray name="form">
              {({ remove, push, move }) => (
                <div className="InnerFieldArray">
                  {/*Map over the stages of the form*/}
                  {values.form.length > 0 &&
                    values.form.map((value, index) => (
                      <Fields
                        path={`form[${index}].fields`}
                        formValues={values}
                        index={index}
                        remove={remove}
                        move={move}
                      />
                    ))}
                  <div className="AddButtonWrapper">
                    {/*Add a stage button*/}
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
            <button type="submit" className="button large">
              Save
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default Preset;
