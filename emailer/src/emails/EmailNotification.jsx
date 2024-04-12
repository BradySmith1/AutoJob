import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
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
      <Head />
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Text className="text-black text-[32px] leading-[24px] text-center">
              <strong>Your Estimate is Ready</strong>
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello <strong>{props.estimateData.user.fName} {props.estimateData.user.lName}</strong>, Your estimate has been completed.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Your estimate total is: <strong>${grandTotal}</strong>
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              To view the itemized bill, please see the attached PDF file.
              Please contact the company to notify them on wether you will accept
              or deny this estimate.
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              This estimate was intended for{" "}
              <span className="text-black">{props.estimateData.user.fName} {props.estimateData.user.lName}</span>. This email is an automated
              message from AutoJob. If you
              were not expecting this message, you can ignore this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}