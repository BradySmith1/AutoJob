import React, {useState} from "react"
import EstimateInfo from "./estimateCalculator/EstimateInfo";
import Account from "./accountPage/Account";
import Customizer from "./estimateCustomizer/Customizer";
import Calc from "../assets/Calculator.png"
import Cust from "../assets/Customize.png"
import Acc from "../assets/Account.png"
import "./AppSwitcher.css";

function AppSwitcher(){
    const [page, setPage] = useState(0);
    let renderedPage;


    if(page === 0){
        renderedPage = (<EstimateInfo />);
    }else if(page === 1){
        renderedPage = (<Customizer />);
    }else if(page === 2){
        renderedPage = (<Account />);
    }else{
        renderedPage = (<div> </div>)
    }

    return(
        <div className="Switcher">
            <div className="MainMenu">
                <div className="MainMenuButton" onClick={() => {
                    setPage(0);
                }}>
                    <img src={Calc} className="MenuImage"></img>
                </div>
                <div className="MainMenuButton" onClick={() => {
                    setPage(1);
                }}>
                    <img src={Cust} className="MenuImage"></img>
                </div>
                <div className="MainMenuButton" onClick={() => {
                    setPage(2);
                }}>
                    <img src={Acc} className="MenuImage"></img>
                </div>
            </div>
            <div className="PageWrapper">
                {renderedPage}
            </div>
        </div>
    );
}

export default AppSwitcher;