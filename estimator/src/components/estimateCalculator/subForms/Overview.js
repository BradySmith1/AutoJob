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
import billableList from '../../JSONs/billableList.json';

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

function displayOverviewFields(field, billable){
    var jsxElement = (null);
    if(field.name === "Name"){
        jsxElement = (<h3 className="fourth">{field.name}: {billable.name}</h3>);
    } else if(field.name === "Price"){
        jsxElement = (<h3 className="fourth">{field.name}: {billable.price}</h3>);
    } else if(field.name === "Quantity"){
        jsxElement = (<h3 className="fourth">{field.name}: {billable.quantity}</h3>);
    } else{
        jsxElement = (<h3 className="fourth">{field.name}: {billable.inputs[field.name]}</h3>);
    }
    return jsxElement;
}

/**
 * This function returns the JSX object for the component
 * 
 * @param props data from the parent component
 *        props.values, material and fee data from parent
 * @returns JSX object with html of component
 */
function Overview(props){

    console.log(props.schema)
    console.log(props.values)

    const [grandTotal, setGrandTotal] = useState(0);

    //On first render, get the grand total;
    useEffect(() => {
        var total = 0;
        //Loop through the billables
        props.schema.form.forEach((stage, index) => {
            for(var i = 0; i < props.values.form[index][stage.canonicalName].length; i++){
                console.log(props.values.form[index][stage.canonicalName]);
                total = total + (props.values.form[index][stage.canonicalName][i].price * 
                    props.values.form[index][stage.canonicalName][i].quantity);
            }
        })
        setGrandTotal(total.toFixed(2));
    }, []);

    return(
        <>
            {props.displayHeader === true ? (<h2>Estimate Overview</h2>) : (null)}
            <div className="overviewWrapper">
                {/**Map over the billable list to display each the overview for each billable array*/}
                {props.schema.form.map((stage, index) => (
                    <div className="infoWrapper" key={index}>
                        <div className="headerWrapper">
                            <h2>{stage.canonicalName} Costs</h2>
                            {/**display the grand total here */}
                            <h3>Sub Total: ${getTotal(props.values.form[index][stage.canonicalName])}</h3>
                        </div>
                        <div className="divide"></div>
                        {/**Map over the materials and display name, price, and quantity */}
                        {props.values.form[index][stage.canonicalName].map((billable, fieldIndex) => (
                            <div className="contentWrapper" key={fieldIndex}>
                                {billable.Name !== "" ? 
                                (<>
                                    {props.schema.form[index].fields.map((field) => (
                                        (field.showInOverview ? (
                                            displayOverviewFields(field, billable)
                                        ) : (null))
                                    ))}
                                    {/* <h3 className="fourth">{billable.inputs.Name}</h3>
                                    <h3 className="fourth">${billable.inputs.Price}</h3>
                                    <h3 className="fourth">Qty: {billable.inputs.Quantity}</h3> */}
                                </>) : null}
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