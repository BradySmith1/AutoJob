import React, { useMemo, useState, useContext } from "react";
import { AuthContext } from "../authentication/AuthContextProvider";
import Overview from "../estimateCalculator/subForms/Overview";
import axios from 'axios';
import Expandable from "../utilComponents/Expandable";
import "./EstimateHistory.css";


function EstimateHistory(){
    const {jwt} = useContext(AuthContext);
    const [loading, setLoading] = useState(true);

    axios.defaults.headers.common = {
        "Authorization": jwt
    }

    const [pastEstimates, setPastEstimates] = useState([]);

    useMemo(async () => {
        const response = await axios.get('/api/estimates?status=complete');
        console.log(response.data);
        const trimmedData = response.data.map((current) => {
            var newEstimate = {};
            newEstimate.user = current.user;
            newEstimate.form = current.form;
            newEstimate.schema = current.schema;
            return newEstimate;
        });
        console.log(trimmedData);
        setPastEstimates(trimmedData);
        setLoading(false);
    }, [])


    return(
        <div className="HistoryWrapper">
            <div className='TitleBar'>
                <h1>Completed Estimates</h1>
            </div>
            {!loading ? (
                pastEstimates.length > 0 && pastEstimates.map((current) => {
                    return (
                        <Expandable title={current.user.fName + " " + current.user.lName}>
                            <div className="HistoryInfoWrapper">
                                <div className="HistoryInfo">
                                    <h2>Contact</h2>
                                    {current.user.fName} {current.user.lName} <br />
                                    {current.user.email} <br />
                                    {current.user.phoneNumber}

                                </div>
                                <div className="HistoryInfo"> 
                                    <h2>Address</h2>
                                    {current.user.address} {current.user.city} <br />
                                    {current.user.state} {current.user.zip}
                                </div>
                            </div>
                            <Overview values={{form: current.form}} schema={current.schema} displayHeader={false}/>
                        </Expandable>
                    )
                })
            ) : (
                <p>Loading</p>
            )}
        </div>
    );
}

export default EstimateHistory;