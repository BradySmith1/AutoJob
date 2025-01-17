/**
 * @version 1, Ovtober 12th, 2023
 * @author Andrew Monroe
 * @author Brady Smith
 *
 * This component takes all the customer info entries, entered in the estimate form,
 * and retrieves them from the database. It then lets you select one of them from the
 * drop down and uses the estimator component to let you fill out an estimate for them.
 *
 * Uses axios get request to retrieve information from the database and react-select for
 * the drop down.
 */

import "./EstimateInfo.css";
import axios from "axios";
import React, { useContext, useEffect, useMemo, useState } from "react";
import Select from "react-select";
import ImageCarousel from "./ImageCarousel";
import billableList from "../JSONs/billableList.json";
import Library from "./subForms/Library.js";
import Message from "../utilComponents/Message.js";
import dropDownData from "../JSONs/dropDown.json";
import { AuthContext } from "../authentication/AuthContextProvider.js";
import EstimateTypeSelector from "./EstimateTypeSelector.js";
import { NotificationContext } from "../utilComponents/NotificationProvider.js";

//Default estimate data
const DEFAULT_ESTIMATE_DATA = {
  user: {
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
};

/**
 * Packs a user estimate with auto imports
 * @returns Promise for the packed user estimate
 */
async function packUsers() {
  const response = await axios.get("/api/users");
  var userArr = [];
  //Push each user to a local array
  for (const entry of response.data) {
    userArr.push({ user: entry });
  }
  return userArr;
}

/**
 * Get drafts from the backend
 * @returns Promise of the drafts
 */
async function packDrafts() {
  //Get the drafts
  const response = await axios.get("/api/estimate?status=draft");
  return response.data;
}

/**
 * This function takes in an array of json of customer data and creates an
 * array of json objects used to populate the drop down selector.
 *
 * @param {[Json Object]} data
 * @returns {[Json Object]} outputData
 */
function populateDropDown(data) {
  //Create an empty array
  var outputData = [];
  //loop through the customer data
  data.forEach((entry) => {
    //Push a json for the drop down, made from customer data
    outputData.push({
      value: entry,
      label: entry.user.fName + " " + entry.user.lName,
    });
  });
  //return the array of Jsons for the drop down.
  return outputData;
}

/**
 * This function takes in an array of json of customer data and creates an
 * array of json objects used to populate the drop down selector.
 *
 * @param {[Json Object]} data
 * @returns {[Json Object]} outputData
 */
function populateDrafts(data) {
  //Create an empty array
  var outputData = [];
  //loop through the customer data
  data.forEach((entry) => {
    //Push a json for the drop down, made from customer data
    outputData.push({
      value: entry,
      label: entry.user.fName + " " + entry.user.lName,
    });
  });
  //return the array of Jsons for the drop down.
  return outputData;
}

//The default image array
const defaultImages = [];
//The default draft drop down data
var draftDropDown = {};
//THe default user drop down data
var userDropDown = {};

/**
 * This function returns the JSX object for the estimate calculator and
 * contains all the html for it.
 *
 * @returns JSX object for estimate calculator
 */
function EstimateInfo() {
  //pull in jwt context
  const { jwt } = useContext(AuthContext);
  //Pull in add message function from notification context
  const { addMessage } = useContext(NotificationContext);

  //Set jwt in axios headers
  axios.defaults.headers.common = {
    Authorization: jwt,
  };

  //Declare a use state variable that holds the currently selected customer data
  const [currentCustomerData, setCurrentCustomerData] = useState({
    ...DEFAULT_ESTIMATE_DATA,
  });
  //Use state for the images
  const [images, setImages] = useState(defaultImages);
  //Use state for the library display
  const [libDisplay, setLibDisplay] = useState(false);
  //Declare a use state variable that holds the default customer data
  const [dropDown, setDropDown] = useState(dropDownData);
  //Use state for a network error
  const [networkError, setNetworkError] = useState(false);

  useEffect(() => {
    //Get all the customer data
    packUsers()
      .then((data) => {
        userDropDown = populateDropDown(data);
        setDropDown((dropDown) => ({
          ...dropDown,
          users: data,
          userLoading: false,
        }));
      })
      .catch((error) => {
        setNetworkError(true);
      });

    //Get all the draft data
    packDrafts()
      .then((data) => {
        //Change this back to populate drop downs
        draftDropDown = populateDrafts(data);
        setDropDown((dropDown) => ({
          ...dropDown,
          drafts: data,
          draftsLoading: false,
        }));
      })
      .catch((error) => {
        setNetworkError(true);
      });
  }, []);

  /**
   * This function handles the change of the selected drop down
   * item.
   *
   * @param {JSON} selectedOption the selected option
   */
  const handleChange = (selectedOption) => {
    setCurrentCustomerData({ ...selectedOption.value });
    console.log(selectedOption.value);

    //If no images, set the image array to empty
    if (selectedOption.value.user.hasOwnProperty("images")) {
      setImages(selectedOption.value.user.images);
    } else {
      setImages([]);
    }
  };

  //Return the JSX object containing all html for this page
  return (
    <div className="estimateInfo">
      <div className="TitleBar">
        <h1>Estimate Calculator</h1>
      </div>
      <div className="dropDown">
        <div className="selectWrapper">
          <h2 id="selectTitle">
            {dropDown.users.length} Customers Waiting for an Estimate
          </h2>
          {/*If axios has not responded, display an h2 that says loading
                    otherwise, show the drop down */}
          {dropDown.userLoading ? (
            <Message
              message={"Loading..."}
              errorMessage={"This is taking a while. Still loading..."}
              finalErrorMessage={
                "A network error may have occured. Try again later."
              }
              finalTimeout={20000}
              timeout={10000}
              errorCondition={networkError}
            />
          ) : (
            <Select
              className="select"
              options={userDropDown}
              onChange={handleChange}
              placeholder="Select Customer..."
            />
          )}
        </div>
        <div className="selectWrapper">
          <h2 id="selectTitle">
            {dropDown.drafts.length} Unfinished Estimate Drafts
          </h2>
          {/*If axios has not responded, display an h2 that says loading
                    otherwise, show the drop down */}
          {dropDown.draftsLoading ? (
            <Message
              message={"Loading..."}
              errorMessage={"This is taking a while. Still loading..."}
              finalErrorMessage={
                "A network error may have occured. Try again later."
              }
              finalTimeout={20000}
              timeout={10000}
              errorCondition={networkError}
            />
          ) : (
            <Select
              className="select"
              options={draftDropDown}
              onChange={handleChange}
              placeholder="Select Draft..."
            />
          )}
        </div>
      </div>
      {libDisplay ? (
        <Library setDisplay={setLibDisplay} name="Material" />
      ) : null}
      {/**Only display the calculator if there is a selected customer, and give it a key so it refreshes*/}
      {currentCustomerData.user.fName !== "" ? (
        <>
          <div className="customerInfo">
            <span className="DeleteWrapper">
              {/*Delete Estimate Button*/}
              <button
                className="xButton"
                onClick={() => {
                  console.log(currentCustomerData.user._id.$oid);
                  if (currentCustomerData._id === undefined) {
                    /**
                     * This response function will reset the drop downs when deleteing a new estimate
                     */
                    axios
                      .delete(
                        "/api/user?_id=" + currentCustomerData.user._id.$oid
                      )
                      .then((response) => {
                        var users = [...dropDown.users];
                        users.splice(
                          dropDown.users
                            .map((e) => e.user._id.$oid)
                            .indexOf(currentCustomerData.user._id.$oid),
                          1
                        );
                        console.log(users);
                        setCurrentCustomerData(DEFAULT_ESTIMATE_DATA);
                        userDropDown = populateDropDown(users);
                        setDropDown((dropDown) => ({
                          ...dropDown,
                          users: users,
                          draftsLoading: false,
                        }));
                        console.log(response);
                      })
                      .catch(() => {
                        addMessage(
                          "Network Error, could not remove estimate",
                          5000
                        );
                      });
                  } else {
                    /**
                     * This response function will reset the drop downs when deleteing a draft
                     */
                    axios
                      .delete(
                        "/api/estimate?_id=" + currentCustomerData._id.$oid
                      )
                      .then((response) => {
                        var drafts = [...dropDown.drafts];
                        drafts.splice(
                          dropDown.drafts
                            .map((e) => e._id.$oid)
                            .indexOf(currentCustomerData._id.$oid),
                          1
                        );
                        console.log(drafts);
                        setCurrentCustomerData(DEFAULT_ESTIMATE_DATA);
                        draftDropDown = populateDropDown(drafts);
                        setDropDown((dropDown) => ({
                          ...dropDown,
                          drafts: drafts,
                          draftsLoading: false,
                        }));
                        console.log(response);
                      })
                      .catch(() => {
                        addMessage(
                          "Network Error, could not remove estimate",
                          5000
                        );
                      });
                  }
                }}
              >
                Delete This Estimate
              </button>
            </span>
            <div className="infoContainer">
              <div className="infoElement">
                <h2 className="infoHeading">Contact</h2>
                <div className="info">
                  {currentCustomerData.user.fName}{" "}
                  {currentCustomerData.user.lName} <br />
                  {currentCustomerData.user.email} <br />
                  {currentCustomerData.user.phoneNumber}
                </div>
              </div>
              <div className="infoElement">
                <h2 className="infoHeading">Address</h2>
                <div className="info">
                  {currentCustomerData.user.strAddr} <br />
                  {currentCustomerData.user.city}{" "}
                  {currentCustomerData.user.state}{" "}
                  {currentCustomerData.user.zip}
                </div>
              </div>
            </div>
            <div className="infoContainer">
              <div className="infoElement">
                <h2 className="infoHeading">Surfaces and Measurements</h2>
                <div className="info">
                  {currentCustomerData.user.measurements}
                </div>
              </div>
              <div className="infoElement">
                <h2 className="infoHeading">Job Details</h2>
                <div className="info">{currentCustomerData.user.details}</div>
              </div>
            </div>
          </div>
          <ImageCarousel images={images} />
          {/**Schema bundled with drafts FOR NOW */}
          {currentCustomerData.schema === undefined ? (
            <EstimateTypeSelector
              data={currentCustomerData}
              key={currentCustomerData.user._id.$oid}
            />
          ) : (
            <EstimateTypeSelector
              data={currentCustomerData}
              schema={currentCustomerData.schema}
              key={currentCustomerData.user._id.$oid}
            />
          )}
        </>
      ) : null}
    </div>
  );
}

export default EstimateInfo;
