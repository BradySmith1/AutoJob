import React from "react";
import "./Window.css";

function Window(props) {
    return(
        <div className="FullBackground">
            {props.children}
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