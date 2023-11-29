/**
 * @version 1, Octover 12th, 2023
 * @author Andrew Monroe and Brady Smith
 * 
 * This component displays the material library.
 */

import React, { useEffect, useState } from "react";
import './Library.css';
import AddToLibrary from "./AddToLibrary";
import axios from 'axios';
import Billable from "./Billable";
import billableList from "../JSONs/billableList.json";
import Message from "../utilComponents/Message.js";

/**
 * This function compares everything in the estimate form to the
 * material library to determine if it is already imported or not.
 * 
 * @param {billable[]} formData data that is already in the form
 * @param {billable[]} billableData data that is in the library
 * @returns 
 */
function trackImported(formData, billableData){
    //Declare and empty state array

    //Loop through the library
    for(var i = 0; i < billableData.length; i++){;
        var billable = billableData[i].data;

        //Loop through what's currently in the form
        for(var j = 0; j < formData.length; j++){
            var data = formData[j];

            //If the billable object is in the form and in the library,
            //Mark it as imported
            if(billable.name === data.name
                && billable.price === data.price){
                billableData[i].imported = true;
            }

        }
    }
}

/**
 * Search a billable's name to see if it matches a given string
 * @param {JSON} billable 
 * @param {String} searchStr 
 * @returns 
 */
function searchString(billable, searchStr){
    var contains = false;
    var billableName = billable.name.toLowerCase();
    var search = searchStr.toLowerCase();
    billableName = billableName.replace(/\s/g, '');
    search = search.replace(/\s/g, '');

    if(billableName.includes(search)){
        contains = true;
    }

    return contains;
}

/**
 * This function returns the library component, which displays all
 * of the billables of a given category and allows you to import them,
 * discard them, or add a new one.
 * 
 * @param {JSON object} props 
 *      props.insert the function used to import a material
 *      props.setDisplay used to stop displaying this component
 *      props.data data that is currently in the form
 *      props.name name of the billable
 * @returns JSX object containing all the html for the library
 */
function Library(props){

    //Use state for the library
    const [library, setLibrary] = useState([]);
    //Use state for the search string
    const [searchStr, setSearchStr] = useState("");
    //Use state to determine whether or not to display the add
    //billabel popup form
    const [display, setDisplay] = useState(false);
    //Use state to determine if we have recieved the data we need from the server
    const [loading, setLoading] = useState(true);

    //error for get request
    const [getError, setGetError] = useState(false);
    //error for remove
    const [removeError, setRemoveError] = useState(false);
    //error for add
    const [addError, setAddError] = useState(false);

    /**
     * Function for handling search
     * @param {*} event the input field value
     */
    const handleSearch = (event) =>{
        setSearchStr(event.target.value);
    }

    /**
     * This method adds a new billable to the library
     * @param {*} billable the billable to add
     */
    const addToLibrary = (billable) =>{
        //Post the billable
        axios.post('/library', billable, {timeout: 3000}).then((response) => {
            //Set the id
            billable._id = {"$oid" : response.data.insertedId.$oid};
            //Copy all the local billables
            const tempBillables = [...library.billables, {data: billable, imported: false}]
            //set the library to the copy
            setLibrary({name: library.name, billables: tempBillables});
        }).catch((error) => {
            console.log(error.message);
            setAddError(true);
        }
        );
    }

    /**
     * This method removes a billable from the library
     * @param {*} index the index to remove
     */
    const removeFromLibrary = (index) =>{
        //Create a copy of the library
        var libCopy = [...library.billables];
        //Splice out the index we don't want
        libCopy.splice(index, 1);
        //Delete it from the database
        axios.delete(`/library?_id=${library.billables[index].data._id.$oid}`, {timeout: 3000}).then(() => {
            //On deletion, set the library to the new library.
            setLibrary({name: library.name, billables: libCopy});
        }).catch((error) => {
            console.log(error.message);
            setRemoveError(true);
        }
        );
    }

    /**
     * Helper function to modify a billable in the library
     * @param {*} index index of billable we want to modify
     * @param {*} billable billable to replace the one we want modified
     */
    const modifyLibrary = (index, billable) => {
        var libCopy = [...library.billables];
        libCopy[index] = {imported: false, data: billable};
        setLibrary({name: library.name, billables: libCopy});
    }

    /**
     * Helper functio to insert a billable to the calculator
     * @param {*} billable the billable to insert
     */
    const insertBillable = (billable) =>{
        props.insert(0, billable);
        billable.imported = true;
    }

    /**
     * Helper function to get the entire library
     * @param {*} name 
     */
    const getLibrary = (name) =>{
        setLoading(true);

        axios.get('/library?description=' + name).then((response) => {
            //initialize the state array
            var vallueArr = [];
            for(const billable of response.data){
                vallueArr.push({data: billable, imported: false});
            }
            //Initialize the library
            if(props.data !== undefined){
                trackImported(props.data, vallueArr);
            }
            setLibrary({name: name, billables: vallueArr});
            //Set the loading variable to false
            setLoading(false);
        }).catch((error) => {
            setGetError(true);
        });
    }

    //Use effect for grabbing all the relavent billables from the library
    //on the first render
    useEffect(() => {
        //Get all billables from the library that have the needed description
        getLibrary(props.name);

        //Hide the scrollbar on the body while the library is open
        document.body.style.overflowY = 'hidden';
        return () => {
            //show the scollbar on the body when the library closes
            document.body.style.overflowY = 'auto';
        }
    }, []);

    return(
        <div className="pageContainer">
            <div className="overflowWrapper">
                <div className="contentContainer">
                    <div className="libNav">
                        {props.data === undefined && Object.keys(billableList).map((key, index) => (
                                <button className='button' key={index}
                                        onClick={() => {getLibrary(key)}}>
                                    {key}s
                                </button>
                            ))
                        }
                    </div>
                    {/**Titles for each column of the form */}
                    <h2>{library.name} Library</h2>
                    <div className="searchWrapper">
                        <input
                            className="inputBox search"
                            name="search"
                            type="text"
                            value={searchStr}
                            onChange={handleSearch}
                            placeholder="Search..."
                        >
                        </input>
                    </div>
                    {/**Display a loading message if we haven't recieved the data yet */}
                    {loading ? 
                    <Message 
                    message={"Loading data..."}
                    errorMessage={"This is taking a while. Still loading..."}
                    finalErrorMessage={"A network error may have occured. Try again later."}
                    finalTimeout={20000}
                    timeout={10000}
                    errorCondition={getError} />
                    : null}
                    {/**If we arent loading, map over the data */}
                    {!loading &&
                    library.billables.map((billable, index) => (
                        //If the billable name batches the search string,
                        //render it
                        (searchString(billable.data, searchStr) ? 
                            (
                                (props.data !== undefined ? 
                                    (<Billable 
                                        billable={billable}
                                        insertBillable={insertBillable}
                                        removeFromLibrary={removeFromLibrary}
                                        modifyLibrary={modifyLibrary}
                                        index={index}
                                        key={index}
                                    />) 
                                    : 
                                    (<Billable 
                                        billable={billable}
                                        removeFromLibrary={removeFromLibrary}
                                        modifyLibrary={modifyLibrary}
                                        index={index}
                                        key={index}
                                    />)
                                )
                            )
                        : null )
                    ))}
                    <button
                        type="button"
                        className="btn add"
                        onClick={() => {
                            //When this button is clicked, display the
                            //add to library from
                            setDisplay(true);
                        }}    
                    >
                        Add New {library.name}
                    </button>
                </div>
                <button
                        type="button"
                        className="closeBtn btn"
                        onClick={() => {
                            //When this button is clicked, stop displaying the library
                            props.setDisplay(false);
                        }}
                    >
                        Close
                </button>
                {addError ? 
                (<Message
                    timeout={5000}
                    message={"Network error, could not add to library."}
                    setDisplay={setAddError}
                />) 
                : 
                null}
                {removeError ? 
                (<Message
                    timeout={5000}
                    message={"Network error, could not remove from library."}
                    setDisplay={setRemoveError}
                />) 
                : 
                null}
            </div>
            {/**If display has been set to true, display the add to library form */}
            {display ? 
                <AddToLibrary 
                    addToLibrary={addToLibrary}
                    name={library.name}
                    setDisplay={setDisplay}
            /> : null}
        </div>
    );
}

export default Library;