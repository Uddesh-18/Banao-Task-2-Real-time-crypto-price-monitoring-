import express from 'express';
import cors from 'cors'; // Import CORS
import mongoose from 'mongoose';
import cron from 'node-cron';
import axios from 'axios';
import { createClient, RedisClientType } from 'redis';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import Alert from './models/Alert';

const app = express();
const port = 3000;

app.use(cors()); // Enable CORS

// MongoDB Connection
const mongoUri = 'mongodb://127.0.0.1:27017/crypto-monitor'; 
mongoose.connect(mongoUri).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
  process.exit(1);
});

// Redis Client
const redisUrl = 'redis://127.0.0.1:6379'; // Correct Redis URL
const redisClient: RedisClientType = createClient({ url: redisUrl });

redisClient.connect().then(() => {
  console.log('Connected to Redis');
}).catch(err => {
  console.error('Failed to connect to Redis', err);
  process.exit(1);
});

app.use(bodyParser.json());

interface CryptoPrices {
  [key: string]: {
    usd: number;
  };
}

async function fetchCryptoPrices(): Promise<CryptoPrices | null> {
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple,litecoin,cardano,polkadot,dogecoin,uniswap,chainlink,stellar&vs_currencies=usd'
    );
    console.log('API Response:', response.data); // Debugging line
    return response.data as CryptoPrices;
  } catch (error) {
    console.error("Error fetching crypto prices:", error);
    return null;
  }
}



async function cacheCryptoPrices(prices: CryptoPrices) {
  if (prices) {
    redisClient.set('cryptoPrices', JSON.stringify(prices), { EX: 300 });
  }
}

// Send Email Alert
const emailUser = 'f8a395e74c1911'; 
const emailPass = 'e947aacaee14c3'; 
const emailHost = 'sandbox.smtp.mailtrap.io'; 
const emailPort = 2525; 

async function sendEmailAlert(to: string, subject: string, text: string) {
  try {
    const transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
    const info = await transporter.sendMail({ from: 'no-reply@crypto-monitor.com', to, subject, text });
    console.log('Email sent: %s', info.messageId); // For debugging purposes
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
  }
}


app.post('/set-alert', async (req, res) => {
  try {
    const { user, email, crypto, price, condition } = req.body;
    const newAlert = new Alert({ user, email, crypto, price, condition });
    await newAlert.save();
    res.send('Alert set successfully');
  } catch (error) {
    console.error("Error setting alert:", error);
    res.status(500).send("Error setting alert");
  }
});

cron.schedule('*/5 * * * *', async () => {
  const prices = await fetchCryptoPrices();

  if (!prices) {
    console.error("Could not fetch prices, skipping alert check.");
    return;
  }

  const alerts = await Alert.find();

  for (const alert of alerts) {
    if (alert.crypto) {
      const cryptoPriceData = prices[alert.crypto];

      if (cryptoPriceData && cryptoPriceData.usd) {
        const currentPrice = cryptoPriceData.usd;

        if (alert.price != null && alert.email != null) {
          if (
            (alert.condition === 'above' && currentPrice > alert.price) ||
            (alert.condition === 'below' && currentPrice < alert.price)
          ) {
            await sendEmailAlert(alert.email, 'Crypto Price Alert', `The price of ${alert.crypto} is now ${currentPrice}`);
          }
        }
      } else {
        console.warn(`Price data for ${alert.crypto} not found.`);
      }
    } else {
      console.warn('Alert has no associated cryptocurrency.');
    }
  }
});

app.get('/prices', async (req, res) => {
  try {
    const prices = await redisClient.get('cryptoPrices');

    if (prices) {
      res.send(JSON.parse(prices));
    } else {
      const livePrices = await fetchCryptoPrices();
      if (livePrices) {
        await cacheCryptoPrices(livePrices);
        res.send(livePrices);
      } else {
        res.status(500).send('Error fetching live prices');
      }
    }
  } catch (error) {
    console.error("Error getting prices:", error);
    res.status(500).send('Error retrieving prices');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
