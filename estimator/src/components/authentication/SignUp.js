import "./LogIn.css";
import axios from 'axios';
import React, { useEffect, useState } from "react";
import { useFormik } from 'formik';
import * as Yup from "yup";

function SignUp(props){

    const formik = useFormik({
        initialValues: {
            username: "",
            password: "",
            confirmPassword: "",
        },

        validationSchema: Yup.object({
            username: Yup.string()
                .required("Required"),
            
            password: Yup.string()
                .required("Required"),

            password: Yup.string()
                .required("Required"),
        }),

        onSubmit: (values, { resetForm }) => {
            resetForm();
            props.setLoggedIn(true);
        }
    })

    return(
        <div className="AuthWrapper">
            <div className='TitleBar'>
                <h1>Sign Up</h1>
            </div>
            <form id="logIn" onSubmit={formik.handleSubmit}>
                <div className="headerAndInput">
                    <h2>Username</h2>
                    <input 
                        className="authInput"
                        type="text"
                        id="username"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.username}
                    />
                </div>
                <div className="headerAndInput">
                    <h2>Password</h2>
                    <input 
                        className="authInput"
                        type="password"
                        id="password"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.password}
                    />
                </div>
                <div className="headerAndInput">
                    <h2>Confirm Password</h2>
                    <input 
                        className="authInput"
                        type="password"
                        id="confirmPassword"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.confirmPassword}
                    />
                </div>
                <input
                    className="btn logInBtn"
                    type="submit"
                    id="SignUpSubmitButton"
                />
            </form>
            <h3>Already Have an Account?</h3>
            <button onClick={() => {
                    props.setLoggedIn(true);
                }}
                className="btn"
            >
                Log In
            </button>
        </div>
    );
}

export default SignUp;