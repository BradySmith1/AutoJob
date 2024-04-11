import { Button, Html } from "@react-email/components";
import * as React from "react";
import { jsx as _jsx } from "react/jsx-runtime";
export default function EmailNotification() {
  return /*#__PURE__*/_jsx(Html, {
    children: /*#__PURE__*/_jsx(Button, {
      href: "https://example.com",
      style: {
        background: "#000",
        color: "#fff",
        padding: "12px 20px"
      },
      children: "Click me"
    })
  });
}