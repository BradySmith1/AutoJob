import React from "react";
import './MaterialLibrary.css';
import axios from 'axios';

const initialValues = [
        {
            material_type: "bleach",
            price: 8.00,
            quantity: 0
        },
        {
            material_type: "soap",
            price: 3.00,
            quantity: 0
        },
        {
            material_type: "bleach",
            price: 8.00,
            quantity: 0
        }
    ]

function materialLibrary(props){
    const values = initialValues;
    return(
        <div className="pageContainer">
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
                            <button
                                type="button"
                                className="secondary"
                                onClick={() => {
                                    props.insert(index, values[index])
                                    console.log(values[index])
                                }}
                            >
                                import
                            </button>
                        </div>
                    </div>
                ))}
                <button
                    type="button"
                    className="secondary"
                    onClick={() => props.setDisplay(false)}
                >
                    close
                </button>
            </div>
        </div>
    );
}

export default materialLibrary;