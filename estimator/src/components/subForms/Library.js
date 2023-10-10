import React, { useEffect, useState } from "react";
import './Library.css';
import AddToLibrary from "./AddToLibrary";
import axios from 'axios';

const initialValues = [
        {
            name: "",
            price: 0,
            quantity: 1
        }
    ]

function trackImported(formData, billableData){
    var stateArr = [];

    for(var i = 0; i < billableData.length; i++){;
        var bilable = billableData[i];
        var tracked = false;

        for(var j = 0; j < formData.length; j++){
            var data = formData[j];
            if(bilable.name === data.name
                && bilable.price === data.price){
                console.log(data.name)
                tracked = true;
            }

        }
        stateArr.push(tracked);
    }
    return stateArr;
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


    const [values, setValues] = useState(initialValues);
    const [stateArr, setState] = useState([]);
    const [display, setDisplay] = useState(false);
    var [loading, setLoading] = useState(true);

    useEffect(() => {

        try{
            //Get all the customer data
            axios.get('/libraries').then((response) => {
                //Set the customer data to the axios response
                setValues(response.data);
                //Set the loading variable to false
                setLoading(false);
            });
        } catch(error){
            //If an error occurs, log it
            console.log(error);
        }

        document.body.style.overflowY = 'hidden';
        setState(trackImported(props.data, values));
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
                     values.map((billable, index) => (
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
                                            props.insert(0, values[index])
                                            setState(updateImported(stateArr, index))
                                        }}
                                    >
                                        Import
                                    </button>
                                    : <div className="section">Imported</div>
                                }
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
                    values={values}
                    setValues={setValues}
                    name={props.name}
                    setDisplay={setDisplay}
            /> : null}
        </div>
    );
}

export default Library;