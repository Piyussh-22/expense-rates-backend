import "dotenv/config";
import pool from "./db.config.js";

const migrate = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        google_id VARCHAR UNIQUE NOT NULL,
        email VARCHAR UNIQUE NOT NULL,
        name VARCHAR NOT NULL,
        avatar_url VARCHAR,
        default_currency VARCHAR(10) DEFAULT 'INR',
        is_deleted BOOLEAN DEFAULT FALSE, -- Fixed typo: DEAFULT -> DEFAULT
        deleted_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(10) NOT NULL CHECK (type IN ('expense','earn','invest')),
        category VARCHAR(50) NOT NULL,
        amount NUMERIC(12,2) NOT NULL CHECK (amount > 0 AND amount < 99999999.99),
        note VARCHAR(20),
        date TIMESTAMPTZ DEFAULT now(), -- Fixed semicolons to commas
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC); -- Fixed table name typo
      CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    `);
    console.log("Migration complete");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

migrate();
