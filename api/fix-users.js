// Script to fix roles and ensure Admin/Owner users exist
// Run: node fix-users.js

const bcrypt = require('bcrypt');
const { Client } = require('pg');

async function fixUsers() {
  const client = new Client({
    connectionString:
      'postgresql://postgres.gccyewcjjcyxsgsnkqmc:endadmi19__@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres',
  });

  try {
    await client.connect();
    console.log('Connected to database\n');

    // List all users first
    const allUsers = await client.query('SELECT id, username, role FROM users');
    console.log('Current users:');
    allUsers.rows.forEach((u) => console.log(`  - ${u.username} (${u.role})`));
    console.log('');

    const pinHash = await bcrypt.hash('123456', 10);

    // 1. Fix 'owner' user role if needed
    const ownerUser = allUsers.rows.find((u) => u.username === 'owner');
    if (ownerUser) {
      if (ownerUser.role !== 'OWNER') {
        console.log(
          `⚠️ User 'owner' has role ${ownerUser.role}. Updating to OWNER...`,
        );
        await client.query(
          "UPDATE users SET role = 'OWNER' WHERE username = 'owner'",
        );
        console.log("✅ User 'owner' role updated to OWNER");
      } else {
        console.log("✓ User 'owner' currently has OWNER role");
      }
    } else {
      console.log("User 'owner' not found. Creating...");
      await client.query(
        `INSERT INTO users (id, username, pin_hash, role, is_active, created_at)
         VALUES (gen_random_uuid(), 'owner', $1, 'OWNER', true, NOW())`,
        [pinHash],
      );
      console.log("✅ User 'owner' created");
    }

    // 2. Ensure 'admin' user exists
    const adminUser = allUsers.rows.find((u) => u.username === 'admin');
    if (adminUser) {
      console.log("✓ User 'admin' already exists");
    } else {
      console.log("User 'admin' not found. Creating...");
      await client.query(
        `INSERT INTO users (id, username, pin_hash, role, is_active, created_at)
         VALUES (gen_random_uuid(), 'admin', $1, 'ADMIN', true, NOW())`,
        [pinHash],
      );
      console.log("✅ User 'admin' created");
    }

    console.log('\n🎉 Roles fixed! You can login with:');
    console.log('  - owner (PIN: 123456) -> Dashboard Owner');
    console.log('  - admin (PIN: 123456) -> Dashboard Admin');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

fixUsers();
