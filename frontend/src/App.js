import { Form } from 'formik';
import './App.css';
import {default as EstimateForm} from './components/EstimateForm';

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
