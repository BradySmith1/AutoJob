import React from "react";
import { useState } from "react";
import "./Expandable.css";
import expandUp from "../../assets/expandUp.png"
import expandDown from "../../assets/expandDown.png"

function Expandable( props ){
    const [expanded, setExpanded] = useState(false);

    return(
        <>
            <div className="expandableHeader">
                <h2>{props.title}</h2>
                {expanded ? 
                (<img src={expandUp} className="expandImg" onClick={()=> {
                    setExpanded(false)
                }}/>) 
                : 
                (<img src={expandDown} className="expandImg" onClick={()=> {
                    setExpanded(true)
                }}/>)}
            </div>
            {expanded ? (props.children) : (null)}
        </>
    );
}

export default Expandable;