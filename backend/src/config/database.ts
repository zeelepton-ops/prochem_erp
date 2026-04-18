import pgPromise from 'pg-promise';
import { IInitOptions } from 'pg-promise';

const options: IInitOptions<any> = {
  // Logging during development
  query: (e) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Query:', e.query);
    }
  },
  error: (err, _e) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('DB Error:', err);
    }
  },
};

const pgp = pgPromise(options);

const connectionConfig: any = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'bmm_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

// Use SSL for Supabase
if (process.env.DB_SSL === 'require' || process.env.DB_HOST?.includes('supabase')) {
  connectionConfig.ssl = { rejectUnauthorized: false };
}

const db = pgp(connectionConfig);

export { db, pgp };
