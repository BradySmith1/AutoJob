import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Create styles
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#E4E4E4'
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  }
});

// Create Document Component
const BillPDF = () => /*#__PURE__*/_jsx(Document, {
  children: /*#__PURE__*/_jsxs(Page, {
    size: "A4",
    style: styles.page,
    pageNumber: 1,
    children: [/*#__PURE__*/_jsx(View, {
      style: styles.section,
      children: /*#__PURE__*/_jsx(Text, {
        children: "Section #1"
      })
    }), /*#__PURE__*/_jsx(View, {
      style: styles.section,
      children: /*#__PURE__*/_jsx(Text, {
        children: "Section #2"
      })
    })]
  })
});
export default BillPDF;