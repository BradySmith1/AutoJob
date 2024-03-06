import React, { useMemo, useState } from "react";
import "./EstimatePreset.css";
import Seperator from "../utilComponents/Seperator";
import edit from "../../assets/edit.png";
import Window from "../utilComponents/Window";
import Preset from "./Preset";

const fieldsLength = 97;

const calcFields = (estimate) => {
    var fields = "";
    estimate.form.forEach(element => {
        fields = fields + ", " + element.canonicalName;
    });

    fields = fields.substring(2, fields.length);

    if(fields.length >= fieldsLength){
        fields = fields.substring(0, fieldsLength) + "...";
    }

    return fields
}

function EstimatePreset(props) {

    console.log(props.estimate);
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
            <img src={edit} className="EditImg" onClick={() => {
                setDisplay(true);
            }}/>
            {display ? (
                <Window setDisplay={setDisplay}>
                    <div>
                        <Preset preset={props.estimate} setSchema={props.setSchema} index={props.index}/>
                    </div>
                </Window>)     
            : 
                (null)}
        </div>
    )
}

export default EstimatePreset;