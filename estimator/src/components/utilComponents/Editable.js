import React from "react";
import "./Editable.css"

function Editable({ children, path }){
    return(
        <div className="EditableWrapper">
            <img src={path} className="EditableImg" />
            {children}
        </div>
    )
}

export default Editable;