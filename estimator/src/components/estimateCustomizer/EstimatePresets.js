import React, { useMemo, useState } from "react";
import "./EstimatePreset.css";
import Seperator from "../utilComponents/Seperator";
import edit from "../../assets/edit.png";
import Close from "../../assets/Close.png"
import Window from "../utilComponents/Window";
import Preset from "./Preset";
import Left from "../../assets/Up.png"
import Right from "../../assets/Down.png"

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
            <img src={edit} className="EditImg ImgEdit" onClick={() => {
                setDisplay(true);
            }}/>
            {/* <img src={Left} className="EditImg ImgLeft" onClick={() => {
                props.schemaUtils.swap(props.index, props.index - 1);
            }}/>
            <img src={Right} className="EditImg ImgRight" onClick={() => {
                props.schemaUtils.swap(props.index, props.index + 1);
            }}/> */}
            <img src={Close} className="EditImg ImgX" onClick={() => {
                props.schemaUtils.remove(props.index);
            }}/>
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