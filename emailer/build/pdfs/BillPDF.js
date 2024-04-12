import React, { useMemo } from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
const date = new Date();
const day = date.getDate();
const month = date.getMonth() + 1;
const year = date.getFullYear();

// This arrangement can be altered based on how we want the date's format to appear.
const currentDate = `${day}-${month}-${year}`;

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#E4E4E4'
  },
  section: {
    margin: 10,
    padding: 10
  },
  topView: {
    margin: 10,
    padding: 10
  },
  topText: {
    fontSize: 8
  },
  totalText: {
    fontSize: 12,
    width: '100%',
    textAlign: 'right',
    marginTop: '10px'
  },
  bottomBorder: {
    width: '100%',
    borderBottom: "solid",
    borderBottomColor: "black",
    borderBottomWidth: "2px"
  },
  heading: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height: 'auto',
    marginTop: '10px'
  },
  padding: {
    padding: "10px"
  },
  wrap: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%'
  },
  item: {
    width: '20%',
    textAlign: 'left',
    borderBottomWidth: '2px',
    borderBottomColor: 'black',
    borderBottom: 'solid'
  }
});
function getTotal(arr) {
  var total = 0;
  //Loop through billables
  for (var i = 0; i < arr.length; i++) {
    //Add price * quantity to total
    total = total + arr[i].price * arr[i].quantity;
  }
  return total.toFixed(2);
}
function displayOverviewFields(field, billable) {
  var jsxElement = null;
  if (field.name === "Name") {
    jsxElement = /*#__PURE__*/_jsxs(Text, {
      style: styles.topText,
      children: [field.name, ": ", billable.name]
    });
  } else if (field.name === "Price") {
    jsxElement = /*#__PURE__*/_jsxs(Text, {
      style: styles.topText,
      children: [field.name, ": $", billable.price]
    });
  } else if (field.name === "Quantity") {
    jsxElement = /*#__PURE__*/_jsxs(Text, {
      style: styles.topText,
      children: [field.name, ": ", billable.quantity]
    });
  } else {
    jsxElement = /*#__PURE__*/_jsxs(Text, {
      style: styles.topText,
      children: [field.name, ": ", billable.inputs[field.name]]
    });
  }
  return jsxElement;
}
var grandTotal = 0;

// Create Document Component
const BillPDF = props => {
  useMemo(() => {
    var total = 0;
    props.estimateData.schema.form.forEach((stage, index) => {
      for (var i = 0; i < props.estimateData.form[index][stage.canonicalName].length; i++) {
        console.log(props.estimateData.form[index][stage.canonicalName]);
        total = total + props.estimateData.form[index][stage.canonicalName][i].price * props.estimateData.form[index][stage.canonicalName][i].quantity;
      }
    });
    grandTotal = total.toFixed(2);
  }, []);
  return /*#__PURE__*/_jsx(Document, {
    children: /*#__PURE__*/_jsxs(Page, {
      size: "A4",
      style: styles.page,
      children: [/*#__PURE__*/_jsxs(View, {
        style: styles.topView,
        children: [/*#__PURE__*/_jsxs(View, {
          children: [/*#__PURE__*/_jsxs(Text, {
            style: styles.topText,
            children: [props.estimateData.user.fName, " ", props.estimateData.user.lName]
          }), /*#__PURE__*/_jsx(Text, {
            style: styles.topText,
            children: currentDate
          }), /*#__PURE__*/_jsx(Text, {
            style: Object.assign({}, styles.topText, styles.bottomBorder),
            children: "Auto Job Itemized Bill"
          })]
        }), /*#__PURE__*/_jsxs(View, {
          style: styles.padding,
          children: [props.estimateData.schema.form.map((stage, index) => /*#__PURE__*/_jsxs(View, {
            children: [/*#__PURE__*/_jsxs(View, {
              style: Object.assign({}, styles.heading, styles.bottomBorder),
              children: [/*#__PURE__*/_jsx(Text, {
                style: styles.topText,
                children: stage.canonicalName
              }), /*#__PURE__*/_jsxs(Text, {
                style: styles.topText,
                children: ["Sub Total: $", getTotal(props.estimateData.form[index][stage.canonicalName])]
              })]
            }), /*#__PURE__*/_jsx(View, {
              children: props.estimateData.form[index][stage.canonicalName].map((billable, fieldIndex) => /*#__PURE__*/_jsx(View, {
                style: styles.wrap,
                children: props.estimateData.schema.form[index].fields.map(field => field.showInOverview ? /*#__PURE__*/_jsx(View, {
                  style: styles.item,
                  children: displayOverviewFields(field, billable)
                }) : null)
              }))
            })]
          })), /*#__PURE__*/_jsx(View, {
            children: /*#__PURE__*/_jsxs(Text, {
              style: styles.totalText,
              children: ["Grand Total: $", grandTotal]
            })
          })]
        })]
      }), /*#__PURE__*/_jsx(View, {})]
    })
  });
};
export default BillPDF;