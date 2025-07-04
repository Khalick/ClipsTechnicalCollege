const bcrypt = require('bcryptjs');

async function generateHashes() {
  const password1 = 'admin123';
  const password2 = 'clips2024';
  
  const hash1 = await bcrypt.hash(password1, 10);
  const hash2 = await bcrypt.hash(password2, 10);
  
  console.log('Admin password hashes:');
  console.log(`admin: ${hash1}`);
  console.log(`clips_admin: ${hash2}`);
  
  console.log('\nSQL to update:');
  console.log(`UPDATE admins SET password_hash = '${hash1}' WHERE username = 'admin';`);
  console.log(`UPDATE admins SET password_hash = '${hash2}' WHERE username = 'clips_admin';`);
}

generateHashes().catch(console.error);