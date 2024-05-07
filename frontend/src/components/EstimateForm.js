/**
 * @version 1, September 28th, 2023
 * @author Andrew Monroe
 * @author Brady Smith
 *
 * This component is the customer estimate form that populates
 * our mongodb database with customer information.
 *
 * Uses formkik and yup for form handling, axios for the post
 * request to our backend, and react-google-captcha for the captcha.
 */

import "./Form.css";
import DragDrop from "./DragDrop.js";
import { useFormik } from "formik";
import React, { useRef, useState } from "react";
import * as Yup from "yup";
import ReCAPTCHA from "react-google-recaptcha";
import axios from "axios";

//Regular expression for a phone number
const phoneRegExp = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

/**
 * This function returns the estimate form in a JSX object
 * that is then used imported in App.js
 *
 * @returns JSX object, the customer estimate form
 */
function EstimateForm() {
  var pathArray = window.location.pathname.split("/");
  var company_id = pathArray[1];

  //This is used to store the captcha authentication token
  const captchaRef = useRef(null);
  //Array of images
  const [images, setImages] = useState([]);
  //Network error flag
  const [networkError, setNetworkError] = useState(false);

  //Formik data
  const formik = useFormik({
    //Declare initial values for the form
    initialValues: {
      fName: "",
      lName: "",
      email: "",
      phoneNumber: "",
      strAddr: "",
      city: "",
      state: "",
      zip: "",
      measurements: "",
      details: "",
    },

    //Declare a validation schema for the form
    validationSchema: Yup.object({
      fName: Yup.string()
        .max(20, "Must be 20 characters or less")
        .required("Required"),

      lName: Yup.string()
        .max(30, "Must be 30 characters or less")
        .required("Required"),

      email: Yup.string().email("Invalid email address").required("Required"),

      phoneNumber: Yup.string()
        .matches(phoneRegExp, "Invalid phone number")
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

      measurements: Yup.string().max(400, "Must be 400 characters or less"),

      details: Yup.string().max(400, "Must be 400 characters or less"),
    }),

    //This function runs when the submit button is clicked
    onSubmit: (values, { resetForm }) => {
      //Create form data object
      var formData = new FormData();
      formData.append("user", JSON.stringify(values));
      formData.append("company_id", company_id);
      console.log(images);
      //Add images to form data
      images.forEach((file) => {
        formData.append("files", file);
      });
      //Post values to backend
      axios
        .post("/user", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {
          console.log(response);
          window.location.reload(false);
          resetForm();
          setImages([]);
        })
        .catch((error) => {
          setNetworkError(true);
        });

      const token = captchaRef.current.getValue();
      //Reset the captcha
      captchaRef.current.reset();
    },
  });

  //JSX object, html for the form
  //onChange, onBlur, and value fields of each input are handled by formik
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
            placeholder="John"
          />
          {/*If there are unment form requirements and this input has been touched, display error message */}
          {formik.touched.fName && formik.errors.fName ? (
            <p className="Error">{formik.errors.fName}</p>
          ) : null}
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
            placeholder="Doe"
          />
          {/*If there are unment form requirements and this input has been touched, display error message */}
          {formik.touched.lName && formik.errors.lName ? (
            <p className="Error">{formik.errors.lName}</p>
          ) : null}
        </div>
      </div>

      <div className="multiBoxWrapper">
        <div className="inputAndLabel half">
          <h2>Email</h2>
          <input
            className="singleLineInput inputBox"
            type="text"
            id="email"
            name="email"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
            placeholder="example@email.com"
          />
          {/*If there are unment form requirements and this input has been touched, display error message */}
          {formik.touched.email && formik.errors.email ? (
            <p className="Error">{formik.errors.email}</p>
          ) : null}
        </div>

        <div className="inputAndLabel half">
          <h2>Phone Number</h2>
          <input
            className="singleLineInput inputBox"
            type="text"
            id="phoneNumber"
            name="phoneNumber"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.phoneNumber}
            placeholder="(123) 456 7890"
          />
          {/*If there are unment form requirements and this input has been touched, display error message */}
          {formik.touched.phoneNumber && formik.errors.phoneNumber ? (
            <p className="Error">{formik.errors.phoneNumber}</p>
          ) : null}
        </div>
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
          placeholder="123 Lane Street"
        />
        {/*If there are unment form requirements and this input has been touched, display error message */}
        {formik.touched.strAddr && formik.errors.strAddr ? (
          <p className="Error">{formik.errors.strAddr}</p>
        ) : null}
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
            placeholder="New York"
          />
          {/*If there are unment form requirements and this input has been touched, display error message */}
          {formik.touched.city && formik.errors.city ? (
            <p className="Error">{formik.errors.city}</p>
          ) : null}
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
            placeholder="New York"
          />
          {/*If there are unment form requirements and this input has been touched, display error message */}
          {formik.touched.state && formik.errors.state ? (
            <p className="Error">{formik.errors.state}</p>
          ) : null}
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
            placeholder="12345"
          />
          {/*If there are unment form requirements and this input has been touched, display error message */}
          {formik.touched.zip && formik.errors.zip ? (
            <p className="Error">{formik.errors.zip}</p>
          ) : null}
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
        {/*If there are unment form requirements and this input has been touched, display error message */}
        {formik.touched.measurements && formik.errors.measurements ? (
          <p className="Error">{formik.errors.measurements}</p>
        ) : null}
      </div>

      <div className="inputAndLabel">
        <h2>Include Any Images of the Job Site</h2>
        <DragDrop images={images} setImages={setImages} />
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
        {/*If there are unment form requirements and this input has been touched, display error message */}
        {formik.touched.details && formik.errors.details ? (
          <p className="Error">{formik.errors.details}</p>
        ) : null}
      </div>
      {networkError ? (
        <div className="errorWrapper">
          <h3>Network error, could not submit. Try again later.</h3>
        </div>
      ) : null}
      <div className="captcha">
        <ReCAPTCHA sitekey={process.env.REACT_APP_SITE_KEY} ref={captchaRef} />
      </div>
      <input type="submit" id="submitButton" />
    </form>
  );
}

export default EstimateForm;
