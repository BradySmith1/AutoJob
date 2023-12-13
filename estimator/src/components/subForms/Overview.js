/**
 * @version 1, October 26th, 2023
 * @author Andrew Monroe 
 * @author Brady Smith
 * 
 * This component displays an overview of an estimate,
 * listing all billables and their prices as well as
 * sub totals and a grand total.
 */

import React, {useState, useEffect} from "react";
import './Overview.css';
import billableList from '../JSONs/billableList.json';

/**
 * This function gets the totals of billables to
 * display a subtotal.
 * 
 * @param {billable[]} arr array of billables
 * @returns total, the total of the billables
 */
function getTotal(arr){
    var total = 0;
    //Loop through billables
    for(var i = 0; i < arr.length; i++){
        //Add price * quantity to total
        total = total + (arr[i].price * arr[i].quantity);
    }
    return total.toFixed(2);
}

/**
 * This function returns the JSX object for the component
 * 
 * @param props data from the parent component
 *        props.values, material and fee data from parent
 * @returns JSX object with html of component
 */
function Overview(props){

    const [grandTotal, setGrandTotal] = useState(0);

    //On first render, get the grand total;
    useEffect(() => {
        var total = 0;
        //Loop through the billables
        for(const key of Object.keys(billableList)){
            //For each billable, get it's sub total
            for(var i = 0; i < props.values[billableList[key]].length; i++){
                total = total + (props.values[billableList[key]][i].price * 
                                 props.values[billableList[key]][i].quantity);
            }
        }
        setGrandTotal(total.toFixed(2));
    }, []);

    return(
        <>
            <h2>Estimate Overview</h2>
            <div className="overviewWrapper">
                {/**Map over the billable list to display each the overview for each billable array*/}
                {Object.keys(billableList).map((key, index) => (
                    <div className="infoWrapper" key={index}>
                        <div className="headerWrapper">
                            <h2>{key} Costs</h2>
                            {/**display the grand total here */}
                            <h3>Sub Total: ${getTotal(props.values[billableList[key]])}</h3>
                        </div>
                        <div className="divide"></div>
                        {/**Map over the materials and display name, price, and quantity */}
                        {props.values[billableList[key]].map((billable) => (
                            <div className="contentWrapper">
                                {billable.name !== '' ? <h3 className="fourth">{billable.name}</h3> : null}
                                {billable.name !== '' ? <h3 className="fourth">${billable.price}</h3> : null}
                                {billable.name !== '' ? <h3 className="fourth">Qty: {billable.quantity}</h3> : null}
                            </div>
                        ))}
                    </div>
                ))}
                {/**Display grand total */}
                <h2 className="grandTotal">Total: ${grandTotal}</h2>
            </div>
        </>
    );
}

export default Overview;