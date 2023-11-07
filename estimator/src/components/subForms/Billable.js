import React, { useState, useRef, useEffect, useId } from "react";
import './Billable.css';
import axios from 'axios';


function determineBackgroundColor(element, boolean){
    if(boolean){
        element.style.backgroundColor="#0055FF";
    }else{
        element.style.backgroundColor="#adadad";
    }
}

function useOutsideAlerter(ref, setDisplay) {
    useEffect(() => {
      /**
       * Alert if clicked on outside of element
       */
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          setDisplay(false);
        }
      }
      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }

function Billable(props){

    const billableID = useId();
    const importID = useId();
    const scanID = useId();
    const [display, setDisplay] = useState(false);
    const wrapperRef = useRef(null);
    useOutsideAlerter(wrapperRef, setDisplay);

    useEffect(() => {
        if(display){
            determineBackgroundColor(document.getElementById(importID), props.data.auto_update); 
        }
    }, [display])

    return(
        <div className="billableWrapper" ref={wrapperRef} id={props.index}>
            {/**Show the name of the billable item */}
            <div className="section">
                {props.data.name}
            </div>
            {/**Show the price of the billable item */}
            <div className="section">
                ${props.data.price}
            </div>
            {/**Show either an import button or "imported" as well as a remove button
            * for this billable object
            */}
            <div className="buttonsSection">
                {!props.stateArr[props.index] ? 
                    <button
                        type="button"
                        className="btn"
                        onClick={() => {
                            //Here we are inserting this element of the library
                            //into the form
                            props.insert(0, props.library[props.index])
                            props.setState(props.updateImported(props.stateArr, props.index))
                        }}
                    >
                        Import
                    </button>
                    : <p>Imported</p>
                }
                <button
                    type="button"
                    className="btn openOptions"
                    onClick={() => {
                        setDisplay(!display);
                        var offsets = document.getElementById(props.index).getBoundingClientRect();
                        var right = offsets.left;
                        var menuOffset = right - 225;
                        console.log(right)
                        var thisBillable = document.getElementById(billableID);
                        console.log(thisBillable)
                        thisBillable.setAttribute("style", "right: " + menuOffset + "px");
                    }}
                >
                    ...
                </button>
            </div>
            <div className="fixedWrapper" id={billableID}>
                {display ? 
                    (
                        <div className="optionsMenu">
                            <div
                                className="optionsButton tickBox"
                                onClick={() => {
                                    props.data.auto_update = !props.data.auto_update;
                                    determineBackgroundColor(document.getElementById(importID), props.data.auto_update)
                                    console.log(props.data);
                                    axios.put('/library/' + props.data._id.$oid, props.data).then(response => console.log(response));
                                }}
                            >
                                Auto Import
                                <div className="boxTick" id={importID}>

                                </div>
                            </div>
                            <div
                                className="optionsButton tickBox middle"
                                onClick={() => {
                                    //price scan
                                }}
                            >
                                Price Scan
                                <div className="boxTick" id={scanID}>

                                </div>
                            </div>
                            <div
                                    className="optionsButton remove"
                                    onClick={() => {
                                        //Here we are removing this element from the library
                                        //when the x button is clicked
                                        var libCopy = [...props.library];
                                        libCopy.splice(props.index, 1);
                                        axios.delete(`/library?_id=${props.data._id.$oid}`).then(response => console.log(response));
                                        props.setLibrary(libCopy);
                                        setDisplay(false);
                                    }}
                                >
                                    Remove from Library
                            </div>
                        </div>
                    ) 
                    : 
                    (null)
                }
            </div>
        </div>
    );
}

export default Billable;