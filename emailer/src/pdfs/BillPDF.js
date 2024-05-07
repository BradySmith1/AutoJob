/**
 * @version 1, April 14th, 2024
 * @author Andrew Monroe
 * @author Brady Smith
 *
 * This file is the pdf template componant
 * using react-pdf.
 */
import React, { useMemo } from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

//Get the current date
const date = new Date();

//Get the day month and year
const day = date.getDate();
const month = date.getMonth() + 1;
const year = date.getFullYear();

// This arrangement can be altered based on how we want the date's format to appear.
const currentDate = `${day}-${month}-${year}`;

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#E4E4E4",
  },
  section: {
    margin: 10,
    padding: 10,
  },
  topView: {
    margin: 10,
    padding: 10,
  },
  topText: {
    fontSize: 8,
  },
  totalText: {
    fontSize: 12,
    width: "100%",
    textAlign: "right",
    marginTop: "10px",
  },
  bottomBorder: {
    width: "100%",
    borderBottom: "solid",
    borderBottomColor: "black",
    borderBottomWidth: "2px",
  },
  heading: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    height: "auto",
    marginTop: "10px",
  },
  padding: {
    padding: "10px",
  },
  wrap: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  item: {
    width: "20%",
    textAlign: "left",
    borderBottomWidth: "2px",
    borderBottomColor: "black",
    borderBottom: "solid",
  },
});

/**
 * This function gets the total from an array
 * of billables.
 *
 * @param {Array} arr, array of billables
 * @returns {number} rounded total
 */
function getTotal(arr) {
  var total = 0;
  //Loop through billables
  for (var i = 0; i < arr.length; i++) {
    //Add price * quantity to total
    total = total + arr[i].price * arr[i].quantity;
  }
  return total.toFixed(2);
}

/**
 * This function creates a JSX element for a field
 * @param {Object} field, field schema
 * @param {Object} billable, billable data
 * @returns {JSXElement} jsxElement
 */
function displayOverviewFields(field, billable) {
  var jsxElement = null;
  if (field.name === "Name") {
    jsxElement = (
      <Text style={styles.topText}>
        {field.name}: {billable.name}
      </Text>
    );
  } else if (field.name === "Price") {
    jsxElement = (
      <Text style={styles.topText}>
        {field.name}: ${billable.price}
      </Text>
    );
  } else if (field.name === "Quantity") {
    jsxElement = (
      <Text style={styles.topText}>
        {field.name}: {billable.quantity}
      </Text>
    );
  } else {
    jsxElement = (
      <Text style={styles.topText}>
        {field.name}: {billable.inputs[field.name]}
      </Text>
    );
  }
  return jsxElement;
}

//Grand total variable
var grandTotal = 0;

/**
 * This function returns the jsx element for this
 * pdf component.
 *
 * @param {Object} props, estimate data passed down from the emailer script
 * @returns {JSXElement} BillPDF
 */
const BillPDF = (props) => {
  /**
   * This memoiezed function calculates the grand total of the estimate
   */
  useMemo(() => {
    var total = 0;
    props.estimateData.schema.form.forEach((stage, index) => {
      for (
        var i = 0;
        i < props.estimateData.form[index][stage.canonicalName].length;
        i++
      ) {
        console.log(props.estimateData.form[index][stage.canonicalName]);
        total =
          total +
          props.estimateData.form[index][stage.canonicalName][i].price *
            props.estimateData.form[index][stage.canonicalName][i].quantity;
      }
    });
    grandTotal = total.toFixed(2);
  }, []);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.topView}>
          <View>
            <Text style={styles.topText}>
              Estimate For: {props.estimateData.user.fName}{" "}
              {props.estimateData.user.lName}
            </Text>
            <Text style={styles.topText}>{currentDate}</Text>
            <Text
              style={Object.assign({}, styles.topText, styles.bottomBorder)}
            >
              Auto Job Itemized Bill
            </Text>
          </View>
          <View style={styles.padding}>
            {props.estimateData.schema.form.map((stage, index) => (
              <View>
                <View
                  style={Object.assign({}, styles.heading, styles.bottomBorder)}
                >
                  <Text style={styles.topText}>{stage.canonicalName}</Text>
                  <Text style={styles.topText}>
                    Sub Total: $
                    {getTotal(
                      props.estimateData.form[index][stage.canonicalName]
                    )}
                  </Text>
                </View>
                <View>
                  {props.estimateData.form[index][stage.canonicalName].map(
                    (billable, fieldIndex) => (
                      <View style={styles.wrap}>
                        {props.estimateData.schema.form[index].fields.map(
                          (field) =>
                            field.showInOverview ? (
                              <View style={styles.item}>
                                {displayOverviewFields(field, billable)}
                              </View>
                            ) : null
                        )}
                      </View>
                    )
                  )}
                </View>
              </View>
            ))}
            <View>
              <Text style={styles.totalText}>Grand Total: ${grandTotal}</Text>
            </View>
          </View>
        </View>
        <View></View>
      </Page>
    </Document>
  );
};

export default BillPDF;
