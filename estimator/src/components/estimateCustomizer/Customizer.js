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

var count = 0;
var idBuffer = new Buffer(10, '/api/generate_id/20', (data) => {return data});

function Customizer(){
    //const [schema, setSchema] = useState(schemaJSON);
    const {schema, setSchema} = useContext(SchemaContext);
    const {addMessage} = useContext(NotificationContext);

    useMemo(() => {
        axios.get('/api/generate_id/30').then((response) => {
            console.log(response.data);
            idBuffer.initialize(response.data);
        })
    }, []);

    //Pull in jwt
    const {jwt} = useContext(AuthContext);

    //Set axios auth header
    axios.defaults.headers.common = {
        "Authorization": jwt
    }

    //An object containing helper functions for the schema
    const schemaUtils = {
        /**
         * Change, or modify a schema
         * 
         * @param {Object} values, new values for the schema 
         * @param {Number} index, index of the schema to change 
         */
        change: (values, index) => {
            const oldSchema = [...schema]
            var newSchema = [...schema];
            var newValues = {...values};

            console.log(oldSchema[index]);

            //Add new id's
            newValues.form.forEach((stage) => {
                if(stage.stageID === undefined){
                    stage.stageID = idBuffer.read();
                }
            })


            // const keptStages = oldSchema[index].form.filter((stage) => {
            //     var contains = false;
            //     newValues.form.forEach((newStage) => {
            //         if(stage.stageID === newStage.stageID){
            //             contains = true;
            //         }
            //     });
            //     return contains;
            // });

            // var deleteInputs = []
            // keptStages.forEach((stage) => {
            //     var deleteArr = [];
            //     newValues.form.forEach((newStage) => {
            //         if(stage.stageID === newStage.stageID){
            //             const deletedFields = stage.fields.filter((field) => {
            //                 var contains = false;
            //                 newStage.fields.forEach((newField) => {
            //                     if(field.name === newField.name){
            //                         contains = true;
            //                     }
            //                 });
            //                 return !contains;
            //             });
            //             deletedFields.forEach((field) => {
            //                 deleteArr.push(field.name);
            //             });
            //         }
            //     });
            //     if(deleteArr.length > 0){
            //         deleteInputs.push({pID: oldSchema[index].presetID, sID: stage.stageID, delete: deleteArr});
            //     }
            // });

            const deletedStages = oldSchema[index].form.filter((stage) => {
                var contains = false;
                newValues.form.forEach((newStage) => {
                    if(stage.stageID === newStage.stageID){
                        contains = true;
                    }
                });
                return !contains;
            });

            const deletedIds = deletedStages.map((stage) => {
                return stage.stageID;
            });

            newSchema[index] = newValues; 
            setSchema(newSchema);
            axios.put('/api/schema?presetID=' + schema[index].presetID, newValues)
            .then((response) => {
                console.log(response)
                deletedIds.forEach(id => {
                    axios.delete(`/api/library?presetID=${values.presetID}&stageID=${id}`).then((response) => {
                        console.log(response);
                    }).catch((error)=>{
                        if(error.response.status === 404){
                            console.log("No billables of that ID found.")
                        }
                    });
                })
            }).catch((error) => {
                console.log(error)
                setSchema(oldSchema);
            });
        },
        /**
         * swap two schemas in the array
         * 
         * @param {Number} fromIndex 
         * @param {Number} toIndex 
         */
        swap: (fromIndex, toIndex) => {
            if((fromIndex >= 0 && fromIndex < schema.length) && (toIndex >= 0 && toIndex < schema.length)){
                var copySchema = [...schema];
                copySchema[fromIndex] = schema[toIndex];
                copySchema[toIndex] = schema[fromIndex];
                setSchema(copySchema);
            }
        },
        /**
         * Remove a schema from the array
         * 
         * @param {Number} index 
         */
        remove: (index) => {
            if((schema.length > 1) && (index >= 0 && index < schema.length)){
                var copySchema = [...schema];
                const oldSchema = [...schema]
                copySchema.splice(index, 1);
                setSchema(copySchema);
                axios.delete('/api/schema?estimateType=' + schema[index].estimateType).then((response) => {
                    console.log(response);
                    axios.delete('/api/library?presetID=' + oldSchema[index].presetID).then((response) => {
                        console.log(response);
                    }).catch((error)=>{
                        if(error.response.status === 404){
                            console.log("No billables of that ID found.")
                        }
                    });
                }).catch(() => {
                    setSchema(oldSchema);
                });
            }
        },
        /**
         * Add a schema to the array
         * @param {Object} element, the new schema to add 
         */
        push: (element) => {
            var copySchema = [...schema];
            const oldSchema = [...schema];
            element.presetID = idBuffer.read();
            element.form.forEach(stage => {
                stage.stageID = idBuffer.read();
                console.log(stage.stageID);
            });
            copySchema.push(element);
            setSchema(copySchema);
            axios.post('/api/schema', element).then((response) => {
                console.log(response);
            }).catch(() => {
                setSchema(oldSchema)
            });
        }
    }

    return(
        <div className="Customizer">
            <div className='TitleBar'>
                <h1>Estimate Presets</h1>
            </div>
            <div className="PresetsWrapper">
                {schema.map((estimate, index) => {
                    return(<EstimatePreset id={index + estimate.estimateType} estimate={estimate} schemaUtils={schemaUtils} index={index}/>);
                })}
                <div className="AddEstimatePreset" onClick={() => {
                    schemaUtils.push({...defaultEstimate});
                }}>
                    <div className="AddPreset"></div>
                    <h3>Add Preset</h3>
                </div>
            </div>
            <div className='TitleBar'>
                <button className="SavePresetsButton" onClick={() => {
                    addMessage("This is message " + count, 3000);
                    count = count + 1;
                }}>
                    save
                </button>
            </div>
        </div>
    );
}  

export default Customizer;