import { Body, Container, Head, Hr, Html, Text } from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import * as React from "react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    children: [/*#__PURE__*/_jsx(Head, {}), /*#__PURE__*/_jsx(Tailwind, {
      children: /*#__PURE__*/_jsx(Body, {
        className: "bg-white my-auto mx-auto font-sans px-2",
        children: /*#__PURE__*/_jsxs(Container, {
          className: "border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]",
          children: [/*#__PURE__*/_jsx(Text, {
            className: "text-black text-[32px] leading-[24px] text-center",
            children: /*#__PURE__*/_jsx("strong", {
              children: "Your Estimate is Ready"
            })
          }), /*#__PURE__*/_jsxs(Text, {
            className: "text-black text-[14px] leading-[24px]",
            children: ["Hello ", /*#__PURE__*/_jsxs("strong", {
              children: [props.estimateData.user.fName, " ", props.estimateData.user.lName]
            }), ", Your estimate has been completed."]
          }), /*#__PURE__*/_jsxs(Text, {
            className: "text-black text-[14px] leading-[24px]",
            children: ["Your estimate total is: ", /*#__PURE__*/_jsx("strong", {
              children: grandTotal
            })]
          }), /*#__PURE__*/_jsx(Text, {
            className: "text-black text-[14px] leading-[24px]",
            children: "To view the itemized bill, please see the attached PDF file. Please contact the company to notify them on wether you will accept or deny this estimate."
          }), /*#__PURE__*/_jsx(Hr, {
            className: "border border-solid border-[#eaeaea] my-[26px] mx-0 w-full"
          }), /*#__PURE__*/_jsxs(Text, {
            className: "text-[#666666] text-[12px] leading-[24px]",
            children: ["This estimate was intended for", " ", /*#__PURE__*/_jsxs("span", {
              className: "text-black",
              children: [props.estimateData.user.fName, " ", props.estimateData.user.lName]
            }), ". This email is an automated message from AutoJob. If you were not expecting this message, you can ignore this email."]
          })]
        })
      })
    })]
  });
}