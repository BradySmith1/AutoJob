/**
 * @version 1, March 18th, 2024
 * @author Andrew Monroe 
 * @author Brady Smith
 * 
 * This component is the estimate preset preview.
 */
import React, { useMemo, useState } from "react";
import "./EstimatePreset.css";
import Seperator from "../utilComponents/Seperator";
import edit from "../../assets/edit.png";
import Close from "../../assets/Close.png"
import Window from "../utilComponents/Window";
import Preset from "./Preset";
import Left from "../../assets/Up.png"
import Right from "../../assets/Down.png"

//Character length of the string containing the stages
const fieldsLength = 97;

/**
 * This function will truncate text if the names of the stages
 * grow longer than 97 characters.
 * @param {Object} estimate 
 * @returns fields, string representing stages
 */
const calcFields = (estimate) => {
    var fields = "";
    estimate.form.forEach(element => {
        fields = fields + ", " + element.canonicalName;
    });

    fields = fields.substring(2, fields.length);

    if(fields.length >= fieldsLength){
        fields = fields.substring(0, fieldsLength) + "...";
    }

    return fields;
}

/**
 * This method simply displays some information about an estimate preset
 * and renders a window modal on click of a button to display more information
 * about said preset.
 * 
 * @param {Object} props 
 * @returns jsx element
 */
function EstimatePreset(props) {
    
    const fieldString = useMemo(() => calcFields(props.estimate), [props.estimate]);
    const [display, setDisplay] = useState(false);

    return(
        <div className="Preset">
            <div className="PresetTitle">
                <b>{props.estimate.estimateType}</b>
            </div>
            <Seperator />
            <div className="Fields">
                <b>Stages: </b>{fieldString}
            </div>
            <span className="ImgEdit">
                <a
                        data-tooltip-id="menu-tooltip"
                        data-tooltip-content="Customize"
                        data-tooltip-place="bottom"
                        className="Tooltip"
                >
                    <img src={edit} className="EditImg" onClick={() => {
                        setDisplay(true);
                    }}/>
                </a>
            </span>
            {/* <img src={Left} className="EditImg ImgLeft" onClick={() => {
                props.schemaUtils.swap(props.index, props.index - 1);
            }}/>
            <img src={Right} className="EditImg ImgRight" onClick={() => {
                props.schemaUtils.swap(props.index, props.index + 1);
            }}/> */}
            <span className="ImgEdit left">
                <a
                        data-tooltip-id="menu-tooltip"
                        data-tooltip-content="Remove"
                        data-tooltip-place="bottom"
                        className="Tooltip"
                >
                    <img src={Close} className="EditImg ImgX" onClick={() => {
                        props.schemaUtils.remove(props.index);
                    }}/>
                </a>
            </span>
            {display ? (
                <Window setDisplay={setDisplay}>
                    <div className="WindowContainer">
                        <Preset preset={props.estimate} setSchema={props.schemaUtils.change} index={props.index}/>
                    </div>
                </Window>)     
            : 
                (null)}
        </div>
    )
}

export default EstimatePreset;