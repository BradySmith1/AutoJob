import { Html, Heading } from "@react-email/components";
import * as React from "react";

var grandTotal = 0;

export default function EmailNotification(props) {

  var total = 0;
  props.estimateData.schema.form.forEach((stage, index) => {
      for(var i = 0; i < props.estimateData.form[index][stage.canonicalName].length; i++){
          console.log(props.estimateData.form[index][stage.canonicalName]);
          total = total + (props.estimateData.form[index][stage.canonicalName][i].price * 
              props.estimateData.form[index][stage.canonicalName][i].quantity);
      }
  })
  grandTotal = total.toFixed(2);

  return (
    <Html>
      <Heading as='h1'>
        Hello, {props.estimateData.user.fName}, Your Estimate Is Ready.
      </Heading>
      <Heading as='h2'>
        Your estimate total is: ${grandTotal}.
      </Heading>
      <Heading as='h2'>
        View the attached PDF to see the itemized estimate.
      </Heading>

    </Html>
  );
}