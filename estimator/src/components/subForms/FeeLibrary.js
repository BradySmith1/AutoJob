import React, { useEffect, useState } from "react";
import './MaterialLibrary.css';
import axios from 'axios';

const initialValues = [
        {
            fee_title: "Labor",
            price: 100.00,
            quantity: 1
        },
        {
            fee_title: "Outside Service Area",
            price: 30.00,
            quantity: 1
        },
        {
            fee_title: "Repairs Fee",
            price: 20.00,
            quantity: 1
        }
    ]

function trackImported(formData, feeData){
    var stateArr = [];

    for(var i = 0; i < feeData.length; i++){;
        var fee = feeData[i];
        var tracked = false;

        for(var j = 0; j < formData.length; j++){
            var data = formData[j];
            if(fee.fee_title === data.fee_title
                && fee.price === data.price){
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

function FeeLibrary(props){


    const values = initialValues;
    const [stateArr, setState] = useState([]);

    useEffect(() => {
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
                    <h2>Fee Library</h2>
                    <div className="materialHeaders">
                        <div className="section">
                            <h3>No.</h3>
                        </div>
                        <div className="section">
                            <h3>Fee</h3>
                        </div>
                        <div className="section">
                            <h3>Price</h3>
                        </div>
                        <div className="section">
                            <h3>Import</h3>
                        </div>
                    </div>
                    {values.map((fee, index) => (
                        <div className="materialContainer">
                            <div className="section">
                                {index + 1}
                            </div>
                            <div className="section">
                                {fee.fee_title}
                            </div>
                            <div className="section">
                                ${fee.price}
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
        </div>
    );
}

export default FeeLibrary;