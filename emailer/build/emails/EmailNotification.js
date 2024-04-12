import { Html, Heading } from "@react-email/components";
import * as React from "react";
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
var grandTotal = 0;
export default function EmailNotification(props) {
  var total = 0;
  props.estimateData.schema.form.forEach((stage, index) => {
    for (var i = 0; i < props.estimateData.form[index][stage.canonicalName].length; i++) {
      console.log(props.estimateData.form[index][stage.canonicalName]);
      total = total + props.estimateData.form[index][stage.canonicalName][i].price * props.estimateData.form[index][stage.canonicalName][i].quantity;
    }
  });
  grandTotal = total.toFixed(2);
  return /*#__PURE__*/_jsxs(Html, {
    children: [/*#__PURE__*/_jsxs(Heading, {
      as: "h1",
      children: ["Hello, ", props.estimateData.user.fName, ", Your Estimate Is Ready."]
    }), /*#__PURE__*/_jsxs(Heading, {
      as: "h2",
      children: ["Your estimate total is: $", grandTotal, "."]
    }), /*#__PURE__*/_jsx(Heading, {
      as: "h2",
      children: "View the attached PDF to see the itemized estimate."
    })]
  });
}