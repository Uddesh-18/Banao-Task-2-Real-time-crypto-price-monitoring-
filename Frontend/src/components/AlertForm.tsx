import  { useState } from 'react';
import { createAlert } from '../services/api';

const AlertForm = () => {
  const [email, setEmail] = useState('');
  const [crypto, setCrypto] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAlert({ email, crypto, price, condition });
      alert('Alert created!');
    } catch (error) {
      alert('Failed to create alert');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Price Alert</h2>
      <label>Email:</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <label>Cryptocurrency:</label>
      <input
        type="text"
        value={crypto}
        onChange={(e) => setCrypto(e.target.value)}
        required
      />
      <label>Price:</label>
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />
      <label>Condition (e.g., "above" or "below"):</label>
      <input
        type="text"
        value={condition}
        onChange={(e) => setCondition(e.target.value)}
        required
      />
      <button type="submit">Create Alert</button>
    </form>
  );
};

export default AlertForm;
