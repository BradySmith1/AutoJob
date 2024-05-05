/**
 * @version 1, April 14th, 2024
 * @author Andrew Monroe 
 * @author Brady Smith
 * 
 * NOTE: This component has a bad name but i dont want to track down where it
 * is used to change the name. This component simply displays an icon on the
 * left of a child component. 
 */
import React from "react";
import "./Editable.css"

/**
 * This function return the JSX element of this component
 * 
 * @param {JSXElement} children
 * @param {string} path, path to image file 
 * @returns {JSXElement} Editeable
 */
function Editable({ children, path }){
    return(
        <div className="EditableWrapper">
            <img src={path} className="EditableImg" />
            {children}
        </div>
    )
}

export default Editable;