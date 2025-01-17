import  { useEffect, useState } from 'react';
import { fetchPrices } from '../services/api';

const CryptoPrices = () => {
  const [prices, setPrices] = useState({});

  useEffect(() => {
    const loadPrices = async () => {
      try {
        const data = await fetchPrices();
        setPrices(data);
      } catch (error) {
        console.error('Failed to load prices:', error);
      }
    };

    loadPrices();
  }, []);

  return (
    <div>
      <h2>Real-Time Cryptocurrency Prices</h2>
      <table>
        <thead>
          <tr>
            <th>Cryptocurrency</th>
            <th>Price (USD)</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(prices).map(([crypto, details]) => (
            <tr key={crypto}>
              <td>{crypto}</td>
              <td>${details.usd}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CryptoPrices;
