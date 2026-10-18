const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

async function runMigration() {
  const connectionString = process.env.DATABASE_URL || process.argv[2];

  if (!connectionString) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: Missing DATABASE_URL.');
    console.log('\nUsage:');
    console.log('  1. Add DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" to backend/.env');
    console.log('  2. Or run: node scripts/migrate.js "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"');
    console.log('\nAlternatively, you can copy the contents of "backend/sql/full_migration.sql"');
    console.log('and paste it directly into the Supabase Dashboard -> SQL Editor.');
    process.exit(1);
  }

  console.log('Connecting to PostgreSQL database...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('\x1b[32m%s\x1b[0m', 'Connected successfully.');

    const sqlPath = path.join(__dirname, '..', 'sql', 'full_migration.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing migrations from sql/full_migration.sql...');
    await client.query(sql);

    console.log('\x1b[32m%s\x1b[0m', '✅ All migrations executed successfully!');
    console.log('Tables, RLS policies, triggers, and dashboard views are now active in Supabase.');
  } catch (err) {
    console.error('\x1b[31m%s\x1b[0m', 'Migration failed:');
    console.error(err.message || err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
