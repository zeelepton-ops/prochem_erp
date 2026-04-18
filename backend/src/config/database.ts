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

function parseDatabaseUrl(databaseUrl: string) {
  const url = new URL(databaseUrl);
  const database = url.pathname?.slice(1) || '';
  const config: any = {
    host: url.hostname,
    port: parseInt(url.port || '5432', 10),
    database,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
  };

  const sslMode = url.searchParams.get('sslmode');
  if (sslMode === 'require' || sslMode === 'verify-full' || sslMode === 'verify-ca') {
    config.ssl = { rejectUnauthorized: false };
  }

  return config;
}

const connectionConfig: any = process.env.DATABASE_URL
  ? parseDatabaseUrl(process.env.DATABASE_URL)
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'bmm_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    };

// Use SSL for Supabase or explicit DB_SSL
if (
  process.env.DB_SSL === 'require' ||
  process.env.DB_HOST?.includes('supabase') ||
  (process.env.DATABASE_URL && new URL(process.env.DATABASE_URL).searchParams.get('sslmode') === 'require')
) {
  connectionConfig.ssl = { rejectUnauthorized: false };
}

const db = pgp(connectionConfig);

export { db, pgp };
