import './App.css';
import './components/EstimateInfo.js'
import EstimateInfo from './components/EstimateInfo.js';

function App() {
  return (
    <div className="App">
      <div className='TitleBar'>
        <h1>Estimate Calculator</h1>
      </div>
      <EstimateInfo />
    </div>
  );
}

export default App;
