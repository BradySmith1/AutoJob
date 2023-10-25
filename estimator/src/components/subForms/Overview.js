/**
 * @version 1, October 26th, 2023
 * @author Andrew Monroe and Brady Smith
 * 
 * This component displays an overview of an estimate,
 * listing all billables and their prices as well as
 * sub totals and a grand total.
 */

import React, {useState, useEffect} from "react";
import './Overview.css';

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
    return total;
}

/**
 * This function returns the JSX object for the component
 * 
 * @param props data from the parent component
 *        props.values, material and fee data from parent
 * @returns JSX object with html of component
 */
function Overview(props){

    //State for fee total
    const [feeTotal, setFeeTotal] = useState(0);
    //State for material total
    const [materialTotal, setMaterialTotal] = useState(0);

    //On first render, get the totals of fees and values
    useEffect(() => {
        setFeeTotal(getTotal(props.values.fees));
        setMaterialTotal(getTotal(props.values.materials));
    }, []);

    return(
        <div className="overviewWrapper">
            <div className="infoWrapper">
                <div className="headerWrapper">
                    <h2>Material Costs</h2>
                    <h3>Sub Total: ${materialTotal}</h3>
                </div>
                <div className="divide"></div>
                {/**Map over the materials and display name, price, and quantity */}
                {props.values.materials.map((material) => (
                    <div className="contentWrapper">
                        {material.name !== '' ? <h3>{material.name}</h3> : null}
                        {material.name !== '' ? <h3>${material.price}</h3> : null}
                        {material.name !== '' ? <h3>Qty: {material.quantity}</h3> : null}
                    </div>
                ))}
            </div>
            <div className="infoWrapper">
                <div className="headerWrapper">
                    <h2>Fees</h2>
                    <h3>Sub Total: ${feeTotal}</h3>
                </div>
                <div className="divide"></div>
                {/**Map over the fees and display name, price, and quantity */}
                {props.values.fees.map((fee) => (
                    <div className="contentWrapper">
                        {fee.name !== '' ? <h3>{fee.name}</h3> : null}
                        {fee.name !== '' ? <h3>${fee.price}</h3> : null}
                        {fee.name !== '' ? <h3>Qty: {fee.quantity}</h3> : null}
                    </div>
                ))}
            </div>
            {/**Display grand total */}
            <h2 className="grandTotal">Total: ${feeTotal + materialTotal}</h2>
        </div>
    );
}

export default Overview;