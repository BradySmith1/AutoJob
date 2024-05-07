/**
 * @version 1, November 29th, 2023
 * @author Andrew Monroe
 * @author Brady Smith
 *
 * This component is used a catch-all error handler and wraps
 * app.js.
 */

import React from "react";

class ErrorBoundry extends React.Component {
  //State for error
  state = { hasError: false };

  //If there is an error, set to true
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  //If we cought an error, display it.
  componentDidCatch(error, info) {
    console.log(error, info);
  }

  //Render method
  render() {
    //If there is an error display fallback else display children
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default ErrorBoundry;
