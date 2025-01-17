"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors")); // Import CORS
const mongoose_1 = __importDefault(require("mongoose"));
const node_cron_1 = __importDefault(require("node-cron"));
const axios_1 = __importDefault(require("axios"));
const redis_1 = require("redis");
const body_parser_1 = __importDefault(require("body-parser"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const Alert_1 = __importDefault(require("./models/Alert"));
const app = (0, express_1.default)();
const port = 3000;
app.use((0, cors_1.default)()); // Enable CORS
// MongoDB Connection
const mongoUri = 'mongodb://127.0.0.1:27017/crypto-monitor'; // Replace with your MongoDB URI and database name
mongoose_1.default.connect(mongoUri).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
});
// Redis Client
const redisUrl = 'redis://127.0.0.1:6379'; // Correct Redis URL
const redisClient = (0, redis_1.createClient)({ url: redisUrl });
redisClient.connect().then(() => {
    console.log('Connected to Redis');
}).catch(err => {
    console.error('Failed to connect to Redis', err);
    process.exit(1);
});
app.use(body_parser_1.default.json());
async function fetchCryptoPrices() {
    try {
        const response = await axios_1.default.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple,litecoin,cardano,polkadot,dogecoin,uniswap,chainlink,stellar&vs_currencies=usd');
        console.log('API Response:', response.data); // Debugging line
        return response.data;
    }
    catch (error) {
        console.error("Error fetching crypto prices:", error);
        return null;
    }
}
async function cacheCryptoPrices(prices) {
    if (prices) {
        redisClient.set('cryptoPrices', JSON.stringify(prices), { EX: 300 });
    }
}
// Send Email Alert
const emailUser = 'f8a395e74c1911'; // Replace with your email user
const emailPass = 'e947aacaee14c3'; // Replace with your email password
const emailHost = 'sandbox.smtp.mailtrap.io'; // Replace with your email service or use another one
const emailPort = 2525; // Mailtrap SMTP port (usually 2525 or 587)
async function sendEmailAlert(to, subject, text) {
    try {
        const transporter = nodemailer_1.default.createTransport({
            host: emailHost,
            port: emailPort,
            auth: {
                user: emailUser,
                pass: emailPass,
            },
        });
        const info = await transporter.sendMail({ from: 'no-reply@crypto-monitor.com', to, subject, text });
        console.log('Email sent: %s', info.messageId); // For debugging purposes
        console.log('Preview URL: %s', nodemailer_1.default.getTestMessageUrl(info));
    }
    catch (error) {
        console.error("Error sending email:", error);
    }
}
app.post('/set-alert', async (req, res) => {
    try {
        const { user, email, crypto, price, condition } = req.body;
        const newAlert = new Alert_1.default({ user, email, crypto, price, condition });
        await newAlert.save();
        res.send('Alert set successfully');
    }
    catch (error) {
        console.error("Error setting alert:", error);
        res.status(500).send("Error setting alert");
    }
});
node_cron_1.default.schedule('*/5 * * * *', async () => {
    const prices = await fetchCryptoPrices();
    if (!prices) {
        console.error("Could not fetch prices, skipping alert check.");
        return;
    }
    const alerts = await Alert_1.default.find();
    for (const alert of alerts) {
        if (alert.crypto) {
            const cryptoPriceData = prices[alert.crypto];
            if (cryptoPriceData && cryptoPriceData.usd) {
                const currentPrice = cryptoPriceData.usd;
                if (alert.price != null && alert.email != null) {
                    if ((alert.condition === 'above' && currentPrice > alert.price) ||
                        (alert.condition === 'below' && currentPrice < alert.price)) {
                        await sendEmailAlert(alert.email, 'Crypto Price Alert', `The price of ${alert.crypto} is now ${currentPrice}`);
                    }
                }
            }
            else {
                console.warn(`Price data for ${alert.crypto} not found.`);
            }
        }
        else {
            console.warn('Alert has no associated cryptocurrency.');
        }
    }
});
app.get('/prices', async (req, res) => {
    try {
        const prices = await redisClient.get('cryptoPrices');
        if (prices) {
            res.send(JSON.parse(prices));
        }
        else {
            const livePrices = await fetchCryptoPrices();
            if (livePrices) {
                await cacheCryptoPrices(livePrices);
                res.send(livePrices);
            }
            else {
                res.status(500).send('Error fetching live prices');
            }
        }
    }
    catch (error) {
        console.error("Error getting prices:", error);
        res.status(500).send('Error retrieving prices');
    }
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});