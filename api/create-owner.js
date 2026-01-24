// Simple script to create Owner user
// Run: node create-owner.js

const bcrypt = require('bcrypt');
const { Client } = require('pg');

async function createOwner() {
  const client = new Client({
    connectionString:
      'postgresql://postgres.gccyewcjjcyxsgsnkqmc:endadmi19__@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres',
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Hash PIN 123456
    const pinHash = await bcrypt.hash('123456', 10);
    console.log('PIN hashed');

    // Check if owner exists
    const checkResult = await client.query(
      "SELECT * FROM users WHERE username = 'owner'",
    );

    if (checkResult.rows.length > 0) {
      console.log('Owner user already exists!');
      return;
    }

    // Insert owner user
    const result = await client.query(
      `INSERT INTO users (id, username, pin_hash, role, is_active, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, true, NOW())
       RETURNING id, username, role`,
      ['owner', pinHash, 'OWNER'],
    );

    console.log('✅ Owner user created successfully!');
    console.log('   Username:', result.rows[0].username);
    console.log('   Role:', result.rows[0].role);
    console.log('   PIN: 123456');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

createOwner();
