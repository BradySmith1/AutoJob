/**
 * @version 1, February 18th, 2024
 * @author Andrew Monroe
 * @author Brady Smith
 *
 * Estimate customizer, array of editeable schemas. These schemas can be selected from in
 * a drop down in the estimate calculator.
 */
import React, { useContext, useEffect, useMemo, useState, useRef } from "react";
import schemaJSON from "../JSONs/schema.json";
import EstimatePreset from "./EstimatePresets";
import axios from "axios";
import defaultEstimate from "../JSONs/defaultEstimate.json";
import "./Customizer.css";
import { SchemaContext } from "./SchemaContextProvider";
import { AuthContext } from "../authentication/AuthContextProvider";
import { NotificationContext } from "../utilComponents/NotificationProvider";
import { Buffer } from "../utilComponents/Buffer";

//Create an id buffer used to add id's to new preset schemas
var idBuffer = new Buffer(10, "/api/generate_id/20", (data) => {
  return data;
});

/**
 * This function is the root component of the customizer page of
 * the application. It lists estimate presets that can then be modified,
 * added to, or deleted from.
 *
 * @returns {JSXElement} Customizer
 */
function Customizer() {
  //const [schema, setSchema] = useState(schemaJSON);
  const { schema, setSchema } = useContext(SchemaContext);
  const { addMessage } = useContext(NotificationContext);

  //Grab 30 id's to use.
  useMemo(() => {
    axios.get("/api/generate_id/30").then((response) => {
      console.log(response.data);
      idBuffer.initialize(response.data);
    });
  }, []);

  //Pull in jwt
  const { jwt } = useContext(AuthContext);

  //Set axios auth header
  axios.defaults.headers.common = {
    Authorization: jwt,
  };

  //An object containing helper functions for the schema
  const schemaUtils = {
    /**
     * Change, or modify a schema.
     *
     * @param {Object} values, new values for the schema
     * @param {Number} index, index of the schema to change
     */
    change: (values, index) => {
      const oldSchema = [...schema];
      var newSchema = [...schema];
      var newValues = { ...values };

      //Add new id's
      newValues.form.forEach((stage) => {
        if (stage.stageID === undefined) {
          stage.stageID = idBuffer.read();
        }
      });

      newSchema[index] = newValues;
      setSchema(newSchema);
      axios
        .put("/api/schema?presetID=" + schema[index].presetID, newValues)
        .then((response) => {
          console.log(response);
          addMessage("Schema Saved", 3000);
        })
        .catch((error) => {
          console.log(error);
          setSchema(oldSchema);
        });
    },
    /**
     * swap two schemas in the array of
     * preset schemas.
     *
     * @param {Number} fromIndex
     * @param {Number} toIndex
     */
    swap: (fromIndex, toIndex) => {
      if (
        fromIndex >= 0 &&
        fromIndex < schema.length &&
        toIndex >= 0 &&
        toIndex < schema.length
      ) {
        var copySchema = [...schema];
        copySchema[fromIndex] = schema[toIndex];
        copySchema[toIndex] = schema[fromIndex];
        setSchema(copySchema);
      }
    },
    /**
     * Remove a schema from the array of
     * preset schemas
     *
     * @param {Number} index
     */
    remove: (index) => {
      //If the schema is not empty and remove index is in bounds
      if (schema.length > 1 && index >= 0 && index < schema.length) {
        var copySchema = [...schema];
        const oldSchema = [...schema];
        copySchema.splice(index, 1);
        setSchema(copySchema);
        axios
          .delete("/api/schema?presetID=" + schema[index].presetID)
          .then((response) => {
            console.log(response);
          })
          .catch(() => {
            setSchema(oldSchema);
            addMessage(
              "A network error has occured, could not delete preset.",
              5000
            );
          });
      }
    },
    /**
     * Add a schema to the array of preset
     * schemas.
     *
     * @param {Object} element, the new schema to add
     */
    push: (element) => {
      var copySchema = [...schema];
      const oldSchema = [...schema];
      element.presetID = idBuffer.read();
      element.form.forEach((stage) => {
        stage.stageID = idBuffer.read();
        console.log(stage.stageID);
      });
      copySchema.push(element);
      setSchema(copySchema);
      axios
        .post("/api/schema", element)
        .then((response) => {
          console.log(response);
        })
        .catch(() => {
          setSchema(oldSchema);
          addMessage(
            "A network error has occured, could not create preset.",
            5000
          );
        });
    },
  };

  return (
    <div className="Customizer">
      <div className="TitleBar">
        <h1>Estimate Presets</h1>
      </div>
      <div className="PresetsWrapper">
        {/*Map over preset schemas*/}
        {schema.map((estimate, index) => {
          return (
            <EstimatePreset
              id={index + estimate.estimateType}
              estimate={estimate}
              schemaUtils={schemaUtils}
              index={index}
            />
          );
        })}
        {/*Add estimate button*/}
        <div
          className="AddEstimatePreset"
          onClick={() => {
            schemaUtils.push({ ...defaultEstimate });
          }}
        >
          <div className="AddPreset"></div>
          <h3>Add Preset</h3>
        </div>
      </div>
    </div>
  );
}

export default Customizer;
