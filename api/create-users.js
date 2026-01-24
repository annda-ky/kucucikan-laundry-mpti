// Script to check/create Owner and Admin users
// Run: node create-users.js

const bcrypt = require('bcrypt');
const { Client } = require('pg');

async function createUsers() {
  const client = new Client({
    connectionString:
      'postgresql://postgres.gccyewcjjcyxsgsnkqmc:endadmi19__@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres',
  });

  try {
    await client.connect();
    console.log('Connected to database\n');

    // List all users first
    const allUsers = await client.query(
      'SELECT username, role, pin_hash FROM users',
    );
    console.log('Current users in database:');
    if (allUsers.rows.length === 0) {
      console.log('  (No users found)');
    } else {
      allUsers.rows.forEach((u) =>
        console.log(`  - ${u.username} (${u.role})`),
      );
    }
    console.log('');

    // Hash PIN 123456
    const pinHash = await bcrypt.hash('123456', 10);

    // Create Owner if not exists
    const ownerExists = allUsers.rows.find((u) => u.role === 'OWNER');
    if (!ownerExists) {
      await client.query(
        `INSERT INTO users (id, username, pin_hash, role, is_active, created_at)
         VALUES (gen_random_uuid(), 'owner', $1, 'OWNER', true, NOW())`,
        [pinHash],
      );
      console.log('✅ Owner user created (username: owner, PIN: 123456)');
    } else {
      console.log('✓ Owner user already exists');
    }

    // Create Admin if not exists
    const adminExists = allUsers.rows.find((u) => u.role === 'ADMIN');
    if (!adminExists) {
      await client.query(
        `INSERT INTO users (id, username, pin_hash, role, is_active, created_at)
         VALUES (gen_random_uuid(), 'admin', $1, 'ADMIN', true, NOW())`,
        [pinHash],
      );
      console.log('✅ Admin user created (username: admin, PIN: 123456)');
    } else {
      console.log('✓ Admin user already exists');
    }

    console.log('\n🎉 Done! You can login with either user using PIN: 123456');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

createUsers();
