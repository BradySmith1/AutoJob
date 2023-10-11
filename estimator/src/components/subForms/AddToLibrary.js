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
            description: props.name
        },
    
        //Declare a validation schema for the form
        validationSchema: Yup.object({
            name: Yup.string()
                .required('Required')
                .max(20, "Must be less than 20 characters"),
    
            price: Yup.number('Must be a number')
                .required('Must be a number'),
        }),

        onSubmit: (values, { resetForm }) => {
            console.log(values);
            props.setValues([...props.values, values]);
            axios.post('/library', values).then(response => console.log(response));
            resetForm();
        }
    
    });


    return(
        <div className="Back">
            <div className="formContainer">
                <h2>Add a new {props.name}</h2>
                <div id="libraryForm">
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
                        {formik.touched.name && formik.errors.name ? <p className="error">{formik.errors.name}</p> : null}
                    </div>
                    <div className="boxAndLable">
                        <h3>Price</h3>
                        <input
                            className="inputBox" 
                            type="number" 
                            id="price" 
                            name="price"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.price}
                        >
                        </input>
                        {formik.touched.price && formik.errors.price ? <p className="error">{formik.errors.name}</p> : null}
                    </div>
                    <button
                        type="submit"
                        className="submitBtn btn"
                        id="submitBtn"
                        onClick={formik.handleSubmit}
                    >
                        Submit
                    </button>
                </div>
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