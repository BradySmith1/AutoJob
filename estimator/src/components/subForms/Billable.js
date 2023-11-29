/**
 * @version 1, November 8th, 2023
 * @author Andrew Monroe and Brady Smith
 * 
 * This component displays a billable and all information in the billable.
 * It has a pop-up advnaced menu to set the auto imprt, price scan, and
 * remove from database features.
 * 
 * NOTE: Currently using a string as a boolean for auto imports
 * since the backend cant query by booleans yet
 */

import React, { useState, useRef, useEffect, useId, Component } from "react";
import './Billable.css';
import axios from 'axios';

/**
 * Function to determine the background color of the tick box
 * @param {HTML element} element, the element to change
 * @param {String} bool, string to decide if we want to change color
 */
function determineBackgroundColor(element, bool){
    if(bool === "true"){
        element.style.backgroundColor="#0055FF";
    }else{
        element.style.backgroundColor="#adadad";
    }
}

/**
 * This method simply toggles a string boolean
 * @param {String} strBool 
 * @returns newStrBool the toggles string boolean
 */
function toggle(strBool){
    var newStrBool = "true";
    if(strBool === "true"){
        newStrBool = "false";
    }
    return newStrBool;
}

/**
 * Custom hook that determines if a click happened of screen anywhere off of
 * the the reference component
 * 
 * @param {Component} ref the component to check for clicks
 * @param {useRef} setDisplay set the display to false when clicked off
 */
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

  /**
   * This is the render function for displaying a billable. Contains
   * all the html needed to display a billable.
   * 
   * @param {JSON} props data from the parent component
   * @returns JSX object for a billable
   */
function Billable(props){

    //ID for this billable
    const billableID = useId();
    //ID for the auto import tick box
    const importID = useId();
    //ID for the price scanning tick box
    const scanID = useId();
    //Display for the more options menu
    const [display, setDisplay] = useState(false);
    //Ref for the click alerter
    const wrapperRef = useRef(null);
    //Call the click alerter 
    useOutsideAlerter(wrapperRef, setDisplay);

    /**
     * This useEffect is bound to display, and sets the background color
     * of the auto import tick box to the correct color on first render.
     */
    useEffect(() => {
        if(display){
            determineBackgroundColor(document.getElementById(importID), props.billable.data.autoImport); 
            determineBackgroundColor(document.getElementById(scanID), props.billable.data.autoUpdate); 
        }
    }, [display])

    return(
        <div className="billableWrapper" ref={wrapperRef} id={props.index}>
            {/**Show the name of the billable item */}
            <div className="section">
                {props.billable.data.name}
            </div>
            {/**Show the price of the billable item */}
            <div className="section">
                ${props.billable.data.price}
            </div>
            {/**Show either an import button or "imported" as well as a remove button
            * for this billable object
            */}
            <div className="buttonSection">
                {props.insertBillable !== undefined ? 
                    ((!props.billable.imported ? 
                        (
                            <button
                                type="button"
                                className="btn"
                                onClick={() => {
                                    //Here we are inserting this element of the library
                                    //into the form
                                    props.insertBillable(props.billable.data)
                                    props.billable.imported = true;
                                }}
                            >
                                Import
                            </button>
                        )
                        :
                        ( 
                            <div className="mockBtn">
                                Imported
                            </div>
                        )
                    ))
                    :
                    (null)
                }
                <button
                    type="button"
                    className="btn openOptions"
                    onClick={() => {
                        //Open the more options menu on click
                        setDisplay(!display);
                        //Determine position for the menu options
                        var offsets = document.getElementById(props.index).getBoundingClientRect();
                        var menuOffset = offsets.right;
                        var thisBillable = document.getElementById(billableID);
                        if(window.innerWidth < 1176){
                            thisBillable.style.left = menuOffset - 260 + "px";
                        }else{
                            thisBillable.style.left = menuOffset + "px";
                        }
                        thisBillable.style.top = (offsets.top - 115) + "px";
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
                                    //On click, set modify the billable to auto import
                                    props.billable.data.autoImport = toggle(props.billable.data.autoImport);
                                    determineBackgroundColor(document.getElementById(importID), props.billable.data.autoImport)
                                    axios.put('/library/' + props.billable.data._id.$oid, props.billable.data).then((response) => {
                                        console.log(response);
                                    });
                                    if(!props.billable.imported && props.insertBillable !== undefined && props.billable.data.autoImport === "true"){
                                        props.insertBillable(props.billable.data);
                                        props.billable.imported = true;
                                    }
                                }}
                            >
                                Auto Import
                                <div className="boxTick" id={importID}>

                                </div>
                            </div>
                            <div
                                className="optionsButton tickBox middle"
                                onClick={() => {
                                    props.billable.data.autoUpdate = toggle(props.billable.data.autoUpdate);
                                    props.billable.data.company = "homedepot";
                                    determineBackgroundColor(document.getElementById(scanID), props.billable.data.autoUpdate)
                                    axios.put('/library/' + props.billable.data._id.$oid, props.billable.data).then((response) => {
                                        console.log(response);
                                    });
                                    if(props.billable.data.autoUpdate === "true"){
                                        axios.get('/scrape?company=homedepot&name=' + props.billable.data.name).then((response) => {
                                            var billableCopy = {...props.billable.data};
                                            billableCopy.price = response.price;
                                            props.modifyLibrary(props.index, billableCopy);
                                        })
                                    }
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
                                        props.removeFromLibrary(props.index);
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