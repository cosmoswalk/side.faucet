import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import mysql from 'mysql2/promise'; 
import winston from 'winston';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import http from 'http';


const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 8367;

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: '/mobile.dev/api/side_faucet_logs2.txt' }),
  ],
});

const db = mysql.createPool({ 
  host: "localhost",
  user: "newlogin",
  password: "newpar666",
  database: "faucet",
 
});


app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'], 
  allowedHeaders: ['Content-Type', 'x-api-key'] 
}));

app.use(bodyParser.json());
app.use(morgan('combined', {
  stream: {
    write: message => logger.info(message.trim())
  }
}));
function calculateTimeLeft(blockedTime) {
  // Переводим blockedTime в объект Date
  const blockedDate = new Date(blockedTime);

  // Вычисляем время разблокировки, добавляя 24 часа к времени блокировки
  const unlockDate = new Date(blockedDate.getTime() + 24 * 60 * 60 * 1000); 

  // Получаем текущее время на сервере
  const currentDate = new Date();

  // Вычисляем разницу между временем разблокировки и текущим временем
  const difference = unlockDate - currentDate;

  if (difference <= 0) {
    return {
      fullHoursLeft: 0,
      minutesLeft: 0
    };
  }

  
  const minutesLeft = Math.floor(difference / 60000);
  const fullHoursLeft = Math.floor(minutesLeft / 60);
  const remainingMinutes = minutesLeft % 60;

  return {
    fullHoursLeft,
    minutesLeft: remainingMinutes
  };
}



const authenticate = (req, res, next) => {

  const apiKey = req.headers['x-api-key'];
  if (apiKey && apiKey === "35d9abcb-a040-4167-bf12-ffe18756d477") {
    logger.info(`Authenticated request with API key: ${apiKey}  ****  ${new Date().toISOString()}`);
    
    next();
  } else {
    res.status(403).json({ message: 'It is not problems! Wait, please!😊' });

  }
}; app.post('/api/faucet/into', authenticate, async (req, res) => {
  const { walletAddress, ipAddress } = req.body;
  console.log('address --- ' + walletAddress)
  console.log('ip address --- ' + ipAddress)

  try {
    console.log("Querying for blocked IP address...");
    const [ipResults] = await db.query('SELECT * FROM faucetSide WHERE ipAddress = ? AND status = "blocked"', [ipAddress]);
    console.log("Query completed.");
    if (ipResults.length > 0) {
      const { time } = ipResults[0];
      const timeLeft = calculateTimeLeft(time);
      return res.status(454).json({
        message: `Transaction blocked. Please wait ${timeLeft.fullHoursLeft} hour(s) and ${timeLeft.minutesLeft} minute(s)`,
        timeLeft
      });
    }
    
    const [addressResults] = await db.query('SELECT * FROM faucetSide WHERE address = ? AND status = "blocked"', [walletAddress]);
    
    if (addressResults.length > 0) {
      const { time } = addressResults[0];
      const timeLeft = calculateTimeLeft(time);
      return res.status(455).json({
        message: `Transaction blocked. Please wait ${timeLeft.fullHoursLeft} hour(s) and ${timeLeft.minutesLeft} minute(s)`,
        timeLeft
      });
    }
    
    const currentTime = new Date();
    console.log('time1 --- ' + currentTime);

    console.log("Sending request to external API...");

    const externalApiResponse = await axios.post('http://167.235.242.236:8002', { address: walletAddress });
    console.log("Response received from external API.");

    await db.query('INSERT INTO faucetSide (address, ipAddress, time, status) VALUES (?, ?, ?, ?)', [walletAddress, ipAddress, currentTime, 'blocked']);
    
    const txhash = externalApiResponse.data.txhash;
    console.log('time --- ' + currentTime);
    logger.debug("This is a debug message");

    logger.info(`--- IP ADDRESS ${ipAddress} Wallet address ${walletAddress} sent to external API, response: ${JSON.stringify(externalApiResponse.data)}`);
    res.status(200).json({ message: 'Tokens successfully received!', walletAddress, time: currentTime, status: 'blocked', externalApiResponse: externalApiResponse.data, txhash }); 
    
  } catch (error) {
    console.error("An error occurred:", error);
    logger.error(`Error in /api/faucet/into: ${error.message}`);
    res.status(500).json({ success: false, message: 'Error processing your request' });
  }
});


  

app.get('/health1', (req, res) => {
  res.status(200).json({ message: 'Server is running!' });
});

app.get('/side_faucet_logs', (req, res) => {
  logger.info('Log file requested');
  res.sendFile(path.join(__dirname, '/mobile.dev/api/side_faucet_logs.txt'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  logger.info(`Server started on port ${port} **** ${new Date().toISOString()} ***`);
});

