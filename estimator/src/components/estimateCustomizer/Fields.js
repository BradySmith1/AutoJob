/**
 * @version 1, March 18th, 2024
 * @author Andrew Monroe
 * @author Brady Smith
 *
 * This component represents the individual fields displayed within a stage.
 */

import React from "react";
import { FieldArray, Field } from "formik";
import Seperator from "../utilComponents/Seperator";
import "./Fields.css";
import Editable from "../utilComponents/Editable";
import Close from "../../assets/Close.png";
import Up from "../../assets/Up.png";
import Down from "../../assets/Down.png";
import lightEdit from "../../assets/LightEdit.png";
import Locked from "../../assets/Locked.png";
import defaultSchema from "../JSONs/defaultEstimate.json";
import "react-tooltip/dist/react-tooltip.css";
import { ErrorMessage } from "formik";

//Units that can be selected from the unit drop down
const units = [
  { value: "Number", label: "Number" }, // Just a number
  { value: "Text", label: "Text" }, // Just text
];

//Default schema for a field
const fieldSchema = { ...defaultSchema.form[0].fields[2] };
//Change the name to default
fieldSchema.name = "Default";

/**
 * This function returns the estimate
 * @param {*} props
 * @returns
 */
function Fields(props) {
  return (
    <div className="FieldsWrapper">
      {/*Stage name changer*/}
      <div style={{ display: "flex", alignItems: "center" }}>
        <Editable path={lightEdit}>
          <Field
            className="CanonicalNameTitle NoInputStyle Black"
            name={`form[${props.index}].canonicalName`}
          />
        </Editable>
        <div className="errors" style={{ marginLeft: "0px" }}>
          <ErrorMessage
            name={`form[${props.index}].canonicalName`}
            component="div"
          />
        </div>
      </div>
      <Seperator borderColor="white" />
      <FieldArray name={props.path}>
        {({ remove, push }) => (
          <div>
            {/*Map over the fields in the stage */}
            {props.formValues.form[props.index].fields.length > 0 &&
              props.formValues.form[props.index].fields.map((element, index) =>
                /**If this field is editeable */
                element.required === undefined ? (
                  <div className="FieldsContainer">
                    {/**Display input fields */}

                    {/*Name input field */}
                    <div>
                      <Editable path={lightEdit}>
                        <Field
                          className="Name NoInputStyle Black"
                          name={`form[${props.index}].fields[${index}].name`}
                        />
                      </Editable>
                      <div className="errors">
                        <ErrorMessage
                          name={`form[${props.index}].fields[${index}].name`}
                          component="div"
                        />
                      </div>
                    </div>
                    {/*Drop down */}
                    <Field
                      className="Unit"
                      as="select"
                      name={`form[${props.index}].fields[${index}].unit`}
                    >
                      {units.map((unit) => (
                        <option value={`${unit.value}`}>{unit.label}</option>
                      ))}
                    </Field>
                    {/*Tic box*/}
                    <div className="BinaryContainer">
                      <Field
                        className="showInOverview"
                        type="checkbox"
                        name={`form[${props.index}].fields[${index}].showInOverview`}
                      />
                      <p>Show In Overview</p>
                    </div>
                    {/*Remove Field button*/}
                    <button
                      className="RemoveFieldButton xButton"
                      onClick={() => {
                        remove(index);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <a className="not-editable">
                    <div className="FieldsContainer">
                      {/**Display uneditable input fields */}
                      <Editable path={Locked}>
                        <div className="Name FakeField">{element.name}</div>
                      </Editable>

                      {/*Drop down */}
                      <select className="Unit">
                        <option values={element.unit}>{element.unit}</option>
                      </select>

                      {/*Tic box*/}
                      <div className="BinaryContainer">
                        <input
                          type="checkbox"
                          checked="checked"
                          onClick={() => {
                            return false;
                          }}
                        />
                        <p>Show In Overview</p>
                      </div>

                      {/*Fake Remove button*/}
                      <div className="RemoveFieldButton"></div>
                    </div>
                  </a>
                )
              )}
            <div className="AddButtonWrapper">
              {/*Add field button*/}
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
      {/**Remove Button */}
      {props.formValues.form.length > 1 ? (
        <img
          src={Close}
          className="RemoveStage"
          onClick={() => {
            props.remove(props.index);
          }}
        />
      ) : null}
      {/**Swap up button */}
      {props.index > 0 ? (
        <img
          src={Up}
          className="Up Arrow"
          onClick={() => {
            props.move(props.index, props.index - 1);
          }}
        />
      ) : null}
      {/**Swap down button */}
      {props.index < props.formValues.form.length - 1 ? (
        <img
          src={Down}
          className="Down Arrow"
          onClick={() => {
            props.move(props.index, props.index + 1);
          }}
        />
      ) : null}
    </div>
  );
}

export default Fields;
