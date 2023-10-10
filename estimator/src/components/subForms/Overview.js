import React, {useState, useEffect} from "react";
import './Overview.css';

function getTotal(arr){
    var total = 0;
    for(var i = 0; i < arr.length; i++){
        total = total + (arr[i].price * arr[i].quantity);
    }
    return total;
}


function Overview(props){

    const [feeTotal, setFeeTotal] = useState(0);
    const [materialTotal, setMaterialTotal] = useState(0);

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
                {props.values.materials.map((material) => (
                    <div className="contentWrapper">
                        {material.name !== '' ? <h3>{material.name}</h3> : <h3>None</h3>}
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
                {props.values.fees.map((fee) => (
                    <div className="contentWrapper">
                        {fee.name !== '' ? <h3>{fee.name}</h3> : <h3>None</h3>}
                        {fee.name !== '' ? <h3>${fee.price}</h3> : null}
                        {fee.name !== '' ? <h3>Qty: {fee.quantity}</h3> : null}
                    </div>
                ))}
            </div>
            <h2 className="grandTotal">Total: ${feeTotal + materialTotal}</h2>
        </div>
    );
}

export default Overview;