import React, { useEffect, useState } from "react";
import './AddToLibrary.css';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from "yup"

function AddToLibrary(props){


    const formik = useFormik({
        //Declare initial values for the form
        initialValues: {
            name: "",
            price: 0.0,
            quantity: 1,
            description: ""
        },
    
        //Declare a validation schema for the form
        validationSchema: Yup.object({
            name: Yup.string()
                .required('Required')
                .max(20, "Must be less than 20 characters"),
    
            price: Yup.number('Must be a number')
                .required('Required'),
    
            quantity: Yup.number('Must be a number')
                .required('Required')
        }),

        onSubmit: (values, { resetForm }) => {
            values.description = props.name;
            console.log(values);
            props.setValues([...props.values, values]);
            resetForm();
            //axios.post('/library', values).then(response => console.log(response));
        }
    
    });


    return(
        <div className="Back">
            <div className="formContainer">
                <h2>Add a new {props.name}</h2>
                <form id="libraryForm" onSubmit={formik.handleSubmit}>
                    <div className="boxAndLable">
                        <h3>Name</h3>
                        <input
                            className="inputBox" 
                            type="text" 
                            id="name" 
                            name="name"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.name}
                        >
                        </input>
                    </div>
                    <div className="boxAndLable">
                        <h3>Price</h3>
                        <input
                            className="inputBox" 
                            type="text" 
                            id="price" 
                            name="price"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.price}
                        >
                        </input>
                    </div>
                    <div className="boxAndLable">
                        <h3>Qty</h3>
                        <input
                            className="inputBox" 
                            type="text" 
                            id="quantity" 
                            name="quantity"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.quantity}
                        >
                        </input>
                    </div>
                    <button
                        type="submit"
                        className="submitBtn btn"
                        id="submitBtn"
                        onClick={formik.handleSubmit}
                    >
                        Submit
                    </button>
                </form>
                <button 
                    className="btn exit" 
                    onClick={() => {
                        props.setDisplay(false);
                    }}>
                    Close
                </button>
            </div>
        </div>
    )
}

export default AddToLibrary;