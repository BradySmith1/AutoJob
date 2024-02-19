/**
 * @version 1, February 18th, 2024
 * @author Andrew Monroe 
 * @author Brady Smith
 * 
 * This file is the log in page for the application.
 */
import "./LogIn.css";
import axios from 'axios';
import { AuthContext } from "./AuthContextProvider";
import React, { useContext, useState } from "react";
import { useFormik } from 'formik';
import * as Yup from "yup";

function LogIn(props){

    //Errors to display
    const [authError, setAuthError] = useState("");

    //Jwt
    const {jwt, setJwt} = useContext(AuthContext);

    //Set up formik
    const formik = useFormik({
        initialValues: {
            username: "",
            password: ""
        },

        validationSchema: Yup.object({
            username: Yup.string()
                .email("Must be an email address.")
                .required("Required"),
            
            password: Yup.string()
                .required("Required"),
        }),

        onSubmit: (values, { resetForm }) => {
            //Refresh any errors
            setAuthError("");

            //Try to log in
            axios.post('/auth/user/auth', {username: values.username, password: values.password})
                .then((result) => {
                    //If succesful, set the jwt
                    setJwt(result.data.jwt_token);
                    console.log(result);
                    //reset the form
                    resetForm();
                    //Set authenticated to true to display the application
                    props.authenticate(true);
                })
                .catch((error) => {
                    if (error.response) {
                        setAuthError(error.response.data);
                    } else if (error.request){
                        setAuthError(error.request.data);
                    }else{
                        setAuthError("Something went wrong, try again later.");
                    }
                });
        }
    })

    return(
        <div className="LoginWrapper">
            <div className='TitleBar'>
                <h1>Log In</h1>
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
                    {formik.touched.username && formik.errors.username ? <p className="Error">{formik.errors.username}</p> : null}
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
                    {formik.touched.password && formik.errors.password ? <p className="Error">{formik.errors.password}</p> : null}
                </div>
                <input
                    className="btn logInBtn"
                    type="submit"
                    id="LogInSubmitButton"
                />
                <p className="Error">{authError}</p>
            </form>
            <h3>Don't have an account?</h3>
            <button 
                onClick={() => {
                    //On click, swap to sign up page
                    props.setLoggedIn(false);
                }}
                className="btn"
            >
                Sign Up
            </button>
        </div>
    );
}

export default LogIn;