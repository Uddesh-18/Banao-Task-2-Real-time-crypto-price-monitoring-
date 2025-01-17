
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import CryptoPrices from './components/CryptoPrices';
import AlertForm from './components/AlertForm';

const App = () => {
  return (
    <Router>
      <div className="App">
        <h1>Cryptocurrency Price Monitor</h1>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/alerts">Create Alert</Link></li>
          </ul>
        </nav>
        <div className="container">
          <Routes>
            <Route path="/" element={<CryptoPrices />} />
            <Route path="/alerts" element={<AlertForm />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
