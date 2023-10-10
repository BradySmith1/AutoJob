import React, { useEffect, useState } from "react";
import './Library.css';
import AddToLibrary from "./AddToLibrary";
import axios from 'axios';

const initialValues = [
        {
            name: "",
            price: 0,
            quantity: 1,
            description: ""
        }
    ]

function trackImported(formData, billableData){
    var stateArr = [];

    for(var i = 0; i < billableData.length; i++){;
        var billable = billableData[i];
        var tracked = false;

        for(var j = 0; j < formData.length; j++){
            var data = formData[j];
            if(billable.name === data.name
                && billable.price === data.price){
                tracked = true;
            }

        }
        stateArr.push(tracked);
    }
    return stateArr;
}

function getCorrectBillables(arr, description){
    var correctBillables = [];
    for(var i = 0; i < arr.length; i++){
        if(arr[i].description === description){
            correctBillables.push(arr[i]);
        }
    }
    return correctBillables;
}

function updateImported(stateArr, index){
    //copy array
    var arrCopy = [...stateArr];
    //set index to true
    arrCopy[index] = true;
    //return the copy
    return arrCopy;
}

function Library(props){

    const [library, setLibrary] = useState(initialValues);
    const [stateArr, setState] = useState([]);
    const [display, setDisplay] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        try{
            axios.get('/libraries').then((response) => {
                var correctBillables = getCorrectBillables(response.data, props.name);
                setState(trackImported(props.data, correctBillables));
                setLibrary(correctBillables);
                //Set the loading variable to false
                setLoading(false);
            });
        } catch(error){
            //If an error occurs, log it
            console.log(error);
        }

        document.body.style.overflowY = 'hidden';
        return () => {
            document.body.style.overflowY = 'auto';
        }
    }, []);

    return(
        <div className="pageContainer">
            <div className="overflowWrapper">
                <div className="contentContainer">
                    <h2>{props.name} Library</h2>
                    <div className="materialHeaders">
                        <div className="section">
                            <h3>No.</h3>
                        </div>
                        <div className="section">
                            <h3>Name</h3>
                        </div>
                        <div className="section">
                            <h3>Price</h3>
                        </div>
                        <div className="section">
                            <h3>Import</h3>
                        </div>
                    </div>
                    {loading ? <h3>Loading Data...</h3> : null}
                    {!loading &&
                     library.map((billable, index) => (
                        <div className="materialContainer">
                            <div className="section">
                                {index + 1}
                            </div>
                            <div className="section">
                                {billable.name}
                            </div>
                            <div className="section">
                                ${billable.price}
                            </div>
                            <div className="section">
                                {!stateArr[index] ? 
                                    <button
                                        type="button"
                                        className="btn"
                                        onClick={() => {
                                            props.insert(0, library[index])
                                            setState(updateImported(stateArr, index))
                                        }}
                                    >
                                        Import
                                    </button>
                                    : <p>Imported</p>
                                }
                                <button
                                    type="button"
                                    className="removeButton"
                                    onClick={() => {
                                        //Here we are removing this element of the billable array
                                        //when the x button is clicked
                                        var libCopy = [...library];
                                        libCopy.splice(index, 1);
                                        axios.delete(`/library/${billable._id.$oid}`).then(response => console.log(response));
                                        setLibrary(libCopy);
                                    }}
                                >
                                    X
                                </button>
                            </div>
                        </div>
                    ))}
                    <button
                        type="button"
                        className="btn add"
                        onClick={() => {
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
                            props.setDisplay(false);
                        }}
                    >
                        Close
                </button>
            </div>
            {display ? 
                <AddToLibrary 
                    values={library}
                    setValues={setLibrary}
                    name={props.name}
                    setDisplay={setDisplay}
            /> : null}
        </div>
    );
}

export default Library;