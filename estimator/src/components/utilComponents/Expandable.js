import React from "react";
import { useState } from "react";
import "./Expandable.css";

function Expandable( props ){
    const [expanded, setExpanded] = useState(false);

    return(
        <>
            <div className="expandableHeader">
                <h2>{props.title}</h2>
                <button onClick={() => {
                    setExpanded(!expanded);
                }}>Show</button>
            </div>
            {expanded ? (props.children) : (null)}
        </>
    );
}

export default Expandable;