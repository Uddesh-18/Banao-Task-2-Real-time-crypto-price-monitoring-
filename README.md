# Real-Time Cryptocurrency Price Monitoring and Alerting System

## Project Overview

This project is a real-time cryptocurrency price monitoring and alerting system. It fetches real-time prices from the CoinGecko API, allows users to set price alerts, and sends real-time notifications when criteria are met. The system also implements caching using Redis for efficient data retrieval.

## Tech Stack

- **Backend:** Node.js, TypeScript, Express
- **Database:** MongoDB
- **Caching:** Redis
- **Frontend:** React, Material-UI
- **Real-Time Communication:** Socket.io
- **Email Notifications:** Nodemailer, Mailtrap (for testing)
- **Data Source:** CoinGecko API

## Features

1. Real-time price monitoring using CoinGecko API.
2. User-defined price alerts with real-time email notifications.
3. Efficient caching mechanism with Redis.
4. Modern frontend interface with React and Material-UI.

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/Uddesh-18/Banao-Task-2-Real-time-crypto-price-monitoring-.git
   cd your-repository
   ```

2. Install backend dependencies:
   ```sh
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```sh
   cd ../frontend
   npm install
   ```

## Usage

1. Start the backend server:
   ```sh
   cd backend
   npm start
   ```

2. Start the frontend application:
   ```sh
   cd ../frontend
   npm start
   ```

