import React, { useState } from "react";

function YesNoBtn(){

    const [clicked, setClicked] = useState(false);

    return(
        <div className="YesNoWrapper">
        {clicked ? (
            <div className="No" onClick={() => {
                setClicked(true);
                props.enable();
            }}>
                <b>No</b>
            </div>
        ) : (
            <div className="Yes" onClick={() => {
                setClicked(false);
                props.disable();
            }}>
                <b>Yes</b>
            </div>
        )}
        </div>
    );
}

export default YesNoBtn;