/**
 * @version 1, February 18th, 2024
 * @author Andrew Monroe 
 * @author Brady Smith
 * 
 * This file contains a menu side bar to switch pages.
 */
import React, {useState} from "react"
import EstimateInfo from "./estimateCalculator/EstimateInfo";
import EstimateHistory from "./estimateHistory/EstimateHistory";
import Account from "./accountPage/Account";
import Customizer from "./estimateCustomizer/Customizer";
import LibraryPage from "./library/LibraryPage";
import Calc from "../assets/Calculator.png"
import Cust from "../assets/Customize.png"
import Acc from "../assets/Account.png"
import History from "../assets/history.png"
import Lib from "../assets/library.png"
import "./AppSwitcher.css";
import SchemaContextProvider from "./estimateCustomizer/SchemaContextProvider";

/**
 * This function returns the JSX element for this component
 * 
 * @returns {JSXElement}, AppSwitcher
 */
function AppSwitcher(){
    //Current page
    const [page, setPage] = useState(0);
    //The current page
    let renderedPage;

    //If we are at page 0
    if(page === 0){
        //Render the estimate calculator
        renderedPage = (<EstimateInfo />);
    }else if(page === 1){
        //If at 1, render the customizer
        renderedPage = (<Customizer />);
    }else if(page === 2){
        //If at 2, render the account page
        renderedPage = (<EstimateHistory />);
    }else if(page === 3){
        //If at 2, render the account page
        renderedPage = (<LibraryPage />);
    }else if(page === 4){
        //If at 2, render the account page
        renderedPage = (<Account />);
    }else{
        //else, render an empty dive
        renderedPage = (<div> </div>)
    }

    return(
        <div className="Switcher">
            <div className="MainMenu">
                <a
                    data-tooltip-id="menu-tooltip"
                    data-tooltip-content="Estimate Calculator"
                    data-tooltip-place="right"
                >
                <div className="MainMenuButton" onClick={() => {
                    //Set page to 0 on click
                    setPage(0);
                }}>
                    <img src={Calc} className="MenuImage"></img>
                </div>
                </a>
                <a
                    data-tooltip-id="menu-tooltip"
                    data-tooltip-content="Estimate Customizer"
                    data-tooltip-place="right"
                >
                <div className="MainMenuButton" onClick={() => {
                    //Set page to 1 on click
                    setPage(1);
                }}>
                    <img src={Cust} className="MenuImage"></img>
                </div>
                </a>
                <a
                    data-tooltip-id="menu-tooltip"
                    data-tooltip-content="Estimate History"
                    data-tooltip-place="right"
                >
                <div className="MainMenuButton" onClick={() => {
                    //Set page to 2 on click
                    setPage(2);
                }}>
                    <img src={History} className="MenuImage"></img>
                </div>
                </a>
                <a
                    data-tooltip-id="menu-tooltip"
                    data-tooltip-content="Library"
                    data-tooltip-place="right"
                >
                <div className="MainMenuButton" onClick={() => {
                    //Set page to 3 on click
                    setPage(3);
                }}>
                    <img src={Lib} className="MenuImage"></img>
                </div>
                </a>
                <a
                    data-tooltip-id="menu-tooltip"
                    data-tooltip-content="Account Page"
                    data-tooltip-place="right"
                >
                <div className="MainMenuButton" onClick={() => {
                    //Set page to 3 on click
                    setPage(4);
                }}>
                    <img src={Acc} className="MenuImage"></img>
                </div>
                </a>
            </div>
            <div className="PageWrapper">
                <SchemaContextProvider>
                    {/* //display the currently selected page */}
                    {renderedPage}
                </SchemaContextProvider>
            </div>
        </div>
    );
}

export default AppSwitcher;