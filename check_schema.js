const pg = require('pg');

async function checkSchema() {
  const client = new pg.Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'bmm_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });
  
  try {
    await client.connect();
    console.log('Connected to database\n');
    
    const tables = ['raw_materials', 'material_batches', 'sales_orders', 'delivery_notes'];
    
    for (const tableName of tables) {
      try {
        const result = await client.query(
          `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position`,
          [tableName]
        );
        if (result.rows.length > 0) {
          console.log(`TABLE: ${tableName}`);
          console.log('  Columns:');
          result.rows.forEach(row => {
            console.log(`    - ${row.column_name} (${row.data_type})`);
          });
        } else {
          console.log(`TABLE: ${tableName} - NOT FOUND`);
        }
        console.log('');
      } catch (e) {
        console.log(`TABLE: ${tableName} - ERROR: ${e.message}`);
      }
    }
    
  } catch (e) {
    console.error('Connection error:', e.message);
  } finally {
    await client.end();
    process.exit(0);
  }
}

checkSchema();
