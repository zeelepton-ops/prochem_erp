import cors from 'cors';
import { config } from '../config/env';

export const corsOptions = {
  origin: (origin: string | undefined, callback: cors.CorsCallback) => {
    if (!origin) {
      return callback(null, true);
    }

    const allowedOrigins = [
      config.frontendUrl,
      'http://localhost:3000',
      'http://localhost:3001',
      'https://erp.prochemtechnology.com',
      'https://prochem-erp.vercel.app',
    ];

    if (allowedOrigins.includes(origin) || origin.endsWith('.loca.lt')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

export const corsMiddleware = cors(corsOptions);
