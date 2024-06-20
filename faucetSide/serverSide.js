import dotenv from 'dotenv';

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

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 8349;

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
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

const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey && apiKey === "35d9abcb-a040-4167-bf12-ffe18756d477") {
    logger.info(`Authenticated request with API key: ${apiKey} ****  ${new Date().toISOString()}`);
    next();
  } else {
    res.status(403).json({ message: 'It is not problems! Wait, please!' });
  }
};




app.post('/faucet/side', authenticate, async (req, res) => {
  const { walletAddress, ipAddress } = req.body;

  console.log(req.body);
  try {
      const [rows] = await db.query('SELECT status FROM faucetSide WHERE address = ? AND ipAddress = ? ORDER BY time DESC LIMIT 1', [walletAddress, ipAddress]);

      if (rows.length > 0 && rows[0].status === "blocked") {
          return res.status(444).json({ message: "Address is currently blocked." });
      }
  } catch (error) {
      logger.error(`Error in faucet_check: ${error.message}`);
      return res.status(500).json({ message: "Error processing your request" });
  }
});

  
  app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Server is running!' });
  });
  

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    logger.info(`Server started on port ${port} **** ${new Date().toISOString()} ***`);
  });
  
  



//   else {
//     const externalApiCallResponse = await axios.post('http://localhost:8367/api/faucet/side2', { walletAddress, ipAddress }, {
//       headers: { 'x-api-key': '35d9abcb-a040-4167-bf12-ffe18756d477' }
//     });

//     return res.status(externalApiCallResponse.status).json(externalApiCallResponse.data);
//   }
// } 








