import bcrypt from "bcryptjs"

// Function to hash passwords for admin users
async function hashPassword(password) {
  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(password, saltRounds)
  console.log(`Password: ${password}`)
  console.log(`Hashed: ${hashedPassword}`)
  return hashedPassword
}

// Hash common passwords
async function generateHashes() {
  console.log("=== Admin Password Hashes ===\n")

  await hashPassword("admin123")
  console.log("")
  await hashPassword("clips2024")
  console.log("")
  await hashPassword("password123")
  console.log("")
  await hashPassword("admin2024")
}

generateHashes().catch(console.error)
