/**
 * @version 1, April 1st, 2024
 * @author Andrew Monroe
 * @author Brady Smith
 *
 * This file is the estimate history page which allows the user to
 * view previously completed estimates.
 */

import React, { useMemo, useState, useContext } from "react";
import { AuthContext } from "../authentication/AuthContextProvider";
import Overview from "../estimateCalculator/subForms/Overview";
import axios from "axios";
import Expandable from "../utilComponents/Expandable";
import "./EstimateHistory.css";
import { NotificationContext } from "../utilComponents/NotificationProvider";
import { PDFDownloadLink } from "@react-pdf/renderer";
import BillPDFCompany from "./pdfs/BillPDFCompany";

/**
 * Search a billable's name to see if it matches a given string.
 * @param {JSON} billable
 * @param {String} searchStr
 * @returns {boolean} contains
 */
function searchString(string, searchStr) {
  var contains = false;
  var lowerString = string.toLowerCase();
  var search = searchStr.toLowerCase();
  lowerString = lowerString.replace(/\s/g, "");
  search = search.replace(/\s/g, "");

  if (lowerString.includes(search)) {
    contains = true;
  }

  return contains;
}

/**
 * This function returns the jsx element that makes up the estimate
 * history page.
 *
 * @returns {JSXElement} EstimateHistory
 */
function EstimateHistory() {
  //Pull in the jwt
  const { jwt } = useContext(AuthContext);
  //Pull in the notification array
  const { addNotification } = useContext(NotificationContext);
  //Loading state while loading in estimates
  const [loading, setLoading] = useState(true);
  //Number of found items
  var searchStringCount = 0;

  //Set JWT in axios headers
  axios.defaults.headers.common = {
    Authorization: jwt,
  };

  //State array to store all past estimates
  const [pastEstimates, setPastEstimates] = useState([]);

  //This memoied function retrieves all completed estimates and
  //populates the pastEstimates state array with the response data
  useMemo(async () => {
    const response = await axios.get("/api/estimate?status=complete");
    console.log(response.data);
    const trimmedData = response.data.map((current) => {
      var newEstimate = {};
      newEstimate.user = current.user;
      newEstimate.form = current.form;
      newEstimate.schema = current.schema;
      newEstimate._id = current._id;
      newEstimate.date = current.date;
      return newEstimate;
    });
    console.log(trimmedData);
    setPastEstimates(trimmedData);
    setLoading(false);
  }, []);

  //State for searchString
  const [searchStr, setSearchStr] = useState("");

  //Use state to determine whether or not to display the add
  /**
   * Function for handling search
   * @param {*} event the input field value
   */
  const handleSearch = (event) => {
    setSearchStr(event.target.value);
  };

  return (
    <div className="HistoryWrapper">
      <div className="TitleBar">
        <h1>Completed Estimates</h1>
      </div>
      <div className="historySearchWrapper">
        <input
          className="inputBox search searchInput"
          name="search"
          type="text"
          value={searchStr}
          onChange={handleSearch}
          placeholder="Search..."
        ></input>
      </div>
      {!loading ? (
        <>
          {/*Map over past estimates if there are any */}
          {pastEstimates.length > 0 &&
            pastEstimates.map((current, index) => {
              const display = searchString(
                current.user.fName +
                  current.user.lName +
                  current.date.slice(0, 10),
                searchStr
              );
              if (display) {
                searchStringCount++;
              }
              return display ? (
                <Expandable
                  title={
                    current.user.fName +
                    " " +
                    current.user.lName +
                    " | " +
                    current.date.slice(0, 10)
                  }
                >
                  <div className="HistoryInfoWrapper">
                    <div className="HistoryInfo">
                      <h2>Contact</h2>
                      {current.user.fName} {current.user.lName} <br />
                      {current.user.email} <br />
                      {current.user.phoneNumber}
                    </div>
                    <div className="HistoryInfo">
                      <h2>Address</h2>
                      {current.user.strAddr} <br />
                      {current.user.city} {current.user.state},{" "}
                      {current.user.zip}
                    </div>
                  </div>
                  <Overview
                    values={{ form: current.form }}
                    schema={current.schema}
                    displayHeader={false}
                  />
                  <div className="ButtonWrapper">
                    <PDFDownloadLink
                      document={
                        <BillPDFCompany
                          estimateData={current}
                          date={current.date.slice(0, 10)}
                        />
                      }
                      fileName="estimate.pdf"
                    >
                      <button
                        className="button medium"
                        style={{
                          borderRadius: "25px !important",
                          marginRight: "10px",
                        }}
                      >
                        Save PDF
                      </button>
                    </PDFDownloadLink>
                    {/*Delete Button */}
                    <button
                      className="xButton"
                      onClick={() => {
                        /*This function deletes an estimate from the database when
                                          the button is clicked*/
                        var newEstimates = [...pastEstimates];
                        const oldEstimates = [...pastEstimates];
                        setPastEstimates(newEstimates);
                        newEstimates.splice(index, 1);
                        axios
                          .delete(`/api/estimate?_id=${current._id.$oid}`)
                          .then((response) => {
                            console.log(response);
                          })
                          .catch(() => {
                            setPastEstimates(oldEstimates);
                            addNotification(
                              "Network Error: could not delete estimate.",
                              5
                            );
                          });
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </Expandable>
              ) : null;
            })}
          {/*If there are no found estimates but there are estimates in the array, display nothing found */}
          {searchStringCount === 0 && pastEstimates.length > 0 ? (
            <h3 className="Centered">Nothing Found</h3>
          ) : null}
          {/*If there are no past estimates, display no passed estimates */}
          {pastEstimates.length > 0 ? null : (
            <h3 className="Centered">No Past Estimates</h3>
          )}
        </>
      ) : (
        <h2 className="Centered">Loading...</h2>
      )}
    </div>
  );
}

export default EstimateHistory;
