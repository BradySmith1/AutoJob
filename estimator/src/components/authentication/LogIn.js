import "./LogIn.css";
import axios from 'axios';
import { AuthContext } from "./AuthContextProvider";
import React, { useContext, useState } from "react";
import { useFormik } from 'formik';
import * as Yup from "yup";

function LogIn(props){

    const [authError, setAuthError] = useState("");

    const {jwt, setJwt} = useContext(AuthContext);
    console.log(jwt);

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
            setAuthError("");

            axios.post('/auth/user/auth', {username: values.username, password: values.password})
                .then((result) => {
                    setJwt(result.data.jwt_token);
                    resetForm();
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
        <div className="wrapper">
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