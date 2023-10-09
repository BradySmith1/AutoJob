import React, { useEffect, useState } from "react";
import './MaterialLibrary.css';
import axios from 'axios';

const initialValues = [
        {
            material_type: "bleach",
            price: 8.00,
            quantity: 1
        },
        {
            material_type: "soap",
            price: 3.00,
            quantity: 1
        },
        {
            material_type: "chemical",
            price: 8.00,
            quantity: 1
        }
    ]

function trackImported(formData, materialData){
    var stateArr = [];

    for(var i = 0; i < materialData.length; i++){;
        var material = materialData[i];
        var tracked = false;

        for(var j = 0; j < formData.length; j++){
            var data = formData[j];
            if(material.material_type === data.material_type
                && material.price === data.price){
                console.log(data.material_type)
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

function MaterialLibrary(props){


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
                    <h2>Material Library</h2>
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
                    {values.map((material, index) => (
                        <div className="materialContainer">
                            <div className="section">
                                {index + 1}
                            </div>
                            <div className="section">
                                {material.material_type}
                            </div>
                            <div className="section">
                                ${material.price}
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

export default MaterialLibrary;