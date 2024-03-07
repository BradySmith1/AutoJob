import React, { useEffect } from "react";

const setStyles = (props, barStyle) => {
    var newStyles = {...barStyle};
    for(const [key] of Object.entries(barStyle)){
        if(props[key] !== undefined){
            newStyles[key] = props[key];
        }
    }
    return newStyles;
}

function Seperator(props){

    var barStyle = {
        borderBottom: "solid",
        borderColor: "#0055FF",
        borderWidth: "2px",
        borderRadius: "0px",
        width: "100%",
        marginTop: "5px",
        marginBottom: "5px"
    }

    var style = setStyles(props, barStyle);

    return(
        <div style={style}>

        </div>
    );
}

export default Seperator;