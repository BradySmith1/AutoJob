/**
 * @version 1, September 28th, 2023
 * @authors Andrew Monroe and Brady Smith
 *
 * This file is the App.js file used by react in the index.js file.
 */
import "./App.css";
import { default as EstimateForm } from "./components/EstimateForm";

/**
 * Modified this App function from the default to have a header and the estimate
 * form component.
 *
 * @returns JSX object, a header and the estimateForm component.
 */
function App() {
  return (
    <div className="App">
      <div className="TitleBar">
        <h1>Fill Out the Estimate Form Below</h1>
      </div>
      <EstimateForm />
    </div>
  );
}

export default App;
