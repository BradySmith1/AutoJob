/**
 * @version 1, March 17th, 2024
 * @author Andrew Monroe 
 * @author Brady Smith
 * 
 * This component is a modal window wrapper. It will grey
 * out the background and layer a window overtop. It will
 * display a close butotn underneath the window component.
 */
import React from "react";
import "./Window.css";

/**
 * This function returns the JSX element for this component.
 * 
 * @param {Object} props, children and setDisplay function 
 * @returns {JSXElement} Window
 */
function Window(props) {
    return(
        <div className="FullBackground">
            {props.children}
            {/*Close button*/}
            <button
                className="btn"
                onClick={() => {
                    //When this button is clicked, stop displaying the library
                    props.setDisplay(false);
                }}
            >
                Close
            </button>
        </div>
    );
}

export default Window;