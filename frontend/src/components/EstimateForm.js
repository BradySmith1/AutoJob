import './Form.css'
import { useFormik } from 'formik';
import React, { useRef } from "react";
import * as Yup from "yup"
import ReCAPTCHA from "react-google-recaptcha";

function EstimateForm(){

    const captchaRef = useRef(null);

    const formik = useFormik({
        initialValues: {
            fName: "",
            lName: "",
            email: "",
            strAddr: "",
            city: "",
            state: "",
            zip: "",
            measurements: "",
            details: ""
        },

        validationSchema: Yup.object({
            fName: Yup.string()
                .max(20, "Must be 20 characters or less")
                .required("Required"),

            lName: Yup.string()
                .max(30, "Must be 30 characters or less")
                .required("Required"),

            email: Yup.string()
                .email("Invalid email address")
                .required("Required"),  

            strAddr: Yup.string()
                .max(100, "Must be 100 characters or less")
                .required("Required"),

            city: Yup.string()
                .max(30, "Must be 30 characters or less")
                .required("Required"),

            state: Yup.string()
                .max(20, "Must be 20 characters or less")
                .required("Required"),

            zip: Yup.string()
                .max(5, "Invalid Zip Code")
                .min(5, "Invalid Zip Code")
                .matches(/^[0-9]+$/, "Invalid Zip Code"),

            measurements: Yup.string()
                .max(400, "Must be 400 characters or less"),

            details: Yup.string()
                .max(400, "Must be 400 characters or less")
        }),

        onSubmit: (values) => {
            console.log(values)
            const token = captchaRef.current.getValue();
            captchaRef.current.reset();
            console.log(token);
        }
    });
    
    return (
        <form id="estimateForm" onSubmit={formik.handleSubmit}>
            <div className="multiBoxWrapper">

                <div className="inputAndLabel half">
                    <h2>First Name</h2>
                    <input 
                        className="singleLineInput inputBox" 
                        type="text" 
                        id="fName" 
                        name="fName"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.fName}
                    />
                    {formik.touched.fName && formik.errors.fName ? <p className="Error">{formik.errors.fName}</p> : null}
                </div>

                <div className="inputAndLabel half">
                    <h2>Last Name</h2>
                    <input 
                        className="singleLineInput inputBox" 
                        type="text" 
                        id="lName" 
                        name="lName"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.lName}
                    />
                    {formik.touched.lName && formik.errors.lName ? <p className="Error">{formik.errors.lName}</p> : null}
                </div>

            </div>

            <div className="inputAndLabel">
                <h2>Email</h2>
                <input 
                    className="singleLineInput inputBox" 
                    type="text" 
                    id="email" 
                    name="email"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                />
                {formik.touched.email && formik.errors.email ? <p className="Error">{formik.errors.email}</p> : null}
            </div>

            <div className="inputAndLabel">
                <h2>Street Address</h2>
                <input 
                    className="singleLineInput inputBox" 
                    type="text" 
                    id="strAddr" 
                    name="strAddr"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.strAddr}
                />
                {formik.touched.strAddr && formik.errors.strAddr ? <p className="Error">{formik.errors.strAddr}</p> : null}
            </div>

            <div className="multiBoxWrapper">

                <div className="inputAndLabel third">
                    <h2>City</h2>
                    <input 
                        className="singleLineInput inputBox" 
                        type="text" 
                        id="city" 
                        name="city"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.city}
                    />
                    {formik.touched.city && formik.errors.city ? <p className="Error">{formik.errors.city}</p> : null}
                </div>

                <div className="inputAndLabel third">
                    <h2>State</h2>
                    <input 
                        className="singleLineInput inputBox" 
                        type="text" 
                        id="state" 
                        name="state"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.state}
                    />
                    {formik.touched.state && formik.errors.state ? <p className="Error">{formik.errors.state}</p> : null}
                </div>

                <div className="inputAndLabel third">
                    <h2>Zip</h2>
                    <input 
                        className="singleLineInput inputBox" 
                        type="text" 
                        id="zip" 
                        name="zip"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.zip}
                    />
                    {formik.touched.zip && formik.errors.zip ? <p className="Error">{formik.errors.zip}</p> : null}
                </div>

            </div>

            <div className="inputAndLabel">
                <h2>Include Any Surfaces and Their Square Footage</h2>
                <textarea 
                    className="multiLineInput inputBox" 
                    type="text" 
                    id="measurments" 
                    name="measurements" 
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.measurements}
                />
                {formik.touched.measurements && formik.errors.measurements ? <p className="Error">{formik.errors.measurements}</p> : null}
            </div>

            <div className="inputAndLabel">
                <h2>Include Any Images of the Job Site</h2>
                <div class="placeholder">
                    <br/>
                    <br/>
                    Placeholder <br/>
                    Looking to add drag and drop feature here
                </div>
            </div>

            <div className="inputAndLabel">
                <h2>Include Any Other Details of the Job</h2>
                <textarea 
                    className="multiLineInput inputBox" 
                    type="text" 
                    id="details" 
                    name="details"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.details}
                />
                {formik.touched.details && formik.errors.details ? <p className="Error">{formik.errors.details}</p> : null}
            </div>
            <div class="captcha">
                <ReCAPTCHA 
                    sitekey={process.env.REACT_APP_SITE_KEY}
                    ref={captchaRef} 
                />
            </div>
            <input 
                type="submit" 
                id="submitButton"
            />
        </form>
    );
}

export default EstimateForm;