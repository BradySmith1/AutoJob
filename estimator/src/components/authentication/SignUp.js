/**
 * @version 1, February 18th, 2024
 * @author Andrew Monroe 
 * @author Brady Smith
 * 
 * This file is the sign up page for the application.
 */
import "./LogIn.css";
import axios from 'axios';
import React, { useContext, useEffect, useState } from "react";
import { useFormik } from 'formik';
import * as Yup from "yup";
import { NotificationContext } from "../utilComponents/NotificationProvider";

function SignUp(props){

    //Error message
    const [authError, setAuthError] = useState("");
    const {addMessage} = useContext(NotificationContext);

    //Set up formik
    const formik = useFormik({
        initialValues: {
            username: "",
            password: "",
            confirmPassword: "",
        },

        validationSchema: Yup.object({
            username: Yup.string()
                .email("Must be an email address.")
                .required("Required"),
            
            password: Yup.string()
                .required("Required"),

            confirmPassword: Yup.string()
                .required("Required"),
        }),

        onSubmit: async (values, { resetForm }) => {
            //refresh auth errors
            setAuthError("");

            //Make sure passwords match
            if(values.password !== values.confirmPassword){
                setAuthError("Passwords don't match.");
                return;
            }

            //Send request
            const result = await axios.post('/auth/user/enroll', {username: values.username, password: values.password});
            console.log(result);

            //if it wasn't succesfull, display auth error
            if(result.status !== 200){
                setAuthError("Could not create account.");
                return;
            }

            addMessage("Account Creation Succesfull! Please log in.");

            //Reset the form
            resetForm();
            //Show the log in page
            props.setLoggedIn(true);
        }
    })

    return(
        <div className="LoginWrapper">
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
                    {formik.touched.confirmPassword && formik.errors.confirmPassword ? <p className="Error">{formik.errors.confirmPassword}</p> : null}
                </div>
                <p className="Error">{authError}</p>
                <input
                    className="btn logInBtn"
                    type="submit"
                    id="SignUpSubmitButton"
                />
            </form>
            <h3>Already Have an Account?</h3>
            <button onClick={() => {
                    //Show the log in page
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