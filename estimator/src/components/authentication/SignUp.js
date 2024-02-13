import "./LogIn.css";
import axios from 'axios';
import React, { useEffect, useState } from "react";
import { useFormik } from 'formik';
import * as Yup from "yup";

function SignUp(props){

    const [authError, setAuthError] = useState("");

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
            setAuthError("");

            if(values.password !== values.confirmPassword){
                setAuthError("Passwords don't match.");
                return;
            }

            const result = await axios.post('/auth/user/enroll', {username: values.username, password: values.password});
            console.log(result);

            if(result.status !== 200){
                setAuthError("Could not create account.");
                return;
            }

            resetForm();
            props.setLoggedIn(true);
        }
    })

    return(
        <div className="wrapper">
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