import React, { useMemo } from "react";

var barStyle = {
    borderBottom: "solid",
    borderColor: "#0055FF",
    borderWidth: "2px",
    width: "100%",
    marginTop: "5px",
    marginBottom: "5px"
}

const setStyles = (props) => {
    var newStyles = {...barStyle};
    for(const [key] of Object.entries(barStyle)){
        if(props[key] !== undefined){
            newStyles[key] = props[key];
        }
    }
    barStyle = newStyles;
}

function Seperator(props){

    useMemo(() => setStyles(props), [props])

    return(
        <div className="Bar" style={barStyle}>

        </div>
    );
}

export default Seperator;