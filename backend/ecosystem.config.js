module.exports = {
  apps: [{
    name: 'bmm-backend',
    script: 'dist/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      DB_HOST: 'db.glfywcqebopgvpglxiud.supabase.co',
      DB_PORT: 5432,
      DB_NAME: 'postgres',
      DB_USER: 'postgres',
      DB_PASSWORD: 'prochemdbms',
      DB_SSL: 'require',
      JWT_SECRET: 'your_jwt_secret_key_change_in_production',
      JWT_EXPIRY: '7d',
      FRONTEND_URL: 'https://erp.prochemtechnology.com',
      LOG_LEVEL: 'info'
    }
  }]
}