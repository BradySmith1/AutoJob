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
 * @param {JSON} billabe 
 * @param {String} searchStr 
 * @returns 
 */
function searchString(billabe, searchStr){
    var contains = false;
    var billableName = billabe.name.toLowerCase();
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
    //Use state for the state array
    const [searchStr, setSearchStr] = useState("");
    //Use state to determine whether or not to display the add
    //billabel popup form
    const [display, setDisplay] = useState(false);
    //Use state to determine if we have recieved the data we need from the server
    const [loading, setLoading] = useState(true);

    //Function for handling search
    const handleSearch = (event) =>{
        setSearchStr(event.target.value);
    }

    const addToLibrary = (billable) =>{
        axios.post('/library', billable).then((response) => {
            billable._id = {"$oid" : response.data.insertedId.$oid};
            console.log(response);
            setLibrary([...library, {data: billable, imported: false}]);
        });
    }

    const removeFromLibrary = (index) =>{
        var libCopy = [...library];
        libCopy.splice(index, 1);
        axios.delete(`/library?_id=${library[index].data._id.$oid}`).then((response) => {
            console.log(response)
            setLibrary(libCopy);
        });
    }

    const insertBillable = (billable) =>{
        props.insert(0, billable);
        billable.imported = true;
    }

    //Use effect for grabbing all the relavent billables from the library
    //on the first render
    useEffect(() => {
        try{
            //Get all billables from the library that have the needed description
            axios.get('/library?description=' + props.name).then((response) => {
                //initialize the state array
                var vallueArr = [];
                for(const billable of response.data){
                    vallueArr.push({data: billable, imported: false});
                }
                //Initialize the library
                trackImported(props.data, vallueArr);
                console.log(vallueArr);
                setLibrary(vallueArr);
                //Set the loading variable to false
                setLoading(false);
            });
        } catch(error){
            //If an error occurs, log it
            console.log(error);
        }

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
                    {/**Titles for each column of the form */}
                    <h2>{props.name} Library</h2>
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
                    {loading ? <h3>Loading Data...</h3> : null}
                    {/**If we arent loading, map over the data */}
                    {!loading &&
                    library.map((billable, index) => (
                        //If the billable name batches the search string,
                        //render it
                        (searchString(billable.data, searchStr) ? 
                            (
                            <Billable 
                                billable={billable}
                                insertBillable={insertBillable}
                                library={library}
                                removeFromLibrary={removeFromLibrary}
                                index={index}
                                key={index}
                            />
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
                        Add New {props.name}
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
            </div>
            {/**If display has been set to true, display the add to library form */}
            {display ? 
                <AddToLibrary 
                    addToLibrary={addToLibrary}
                    name={props.name}
                    setDisplay={setDisplay}
            /> : null}
        </div>
    );
}

export default Library;