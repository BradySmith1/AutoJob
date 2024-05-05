/**
 * @version 1, March 17th, 2024
 * @author Andrew Monroe 
 * @author Brady Smith
 * 
 * This component is simply a customizeable seperator bar
 */
import React, { useEffect } from "react";

/**
 * Function to set the styles of the seperator
 * @param {Object} props, prop styles 
 * @param {Object} barStyle, default bar style object
 * @returns 
 */
const setStyles = (props, barStyle) => {
    var newStyles = {...barStyle};
    for(const [key] of Object.entries(barStyle)){
        if(props[key] !== undefined){
            newStyles[key] = props[key];
        }
    }
    return newStyles;
}

/**
 * This function returns the JSX of this component
 * 
 * @param {Obejct} props, prop style object 
 * @returns {JSXElement} Seperator
 */
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