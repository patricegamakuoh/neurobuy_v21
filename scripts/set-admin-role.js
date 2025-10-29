// Script to set admin role for a user
// Usage: node scripts/set-admin-role.js your-email@example.com

require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function setAdminRole() {
  const email = process.argv[2]
  
  if (!email) {
    console.error('❌ Error: Please provide an email address')
    console.log('\nUsage: node scripts/set-admin-role.js your-email@example.com')
    process.exit(1)
  }
  
  try {
    console.log(`\n🔍 Looking for user with email: ${email}\n`)
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      console.error(`❌ User with email ${email} not found`)
      console.log('\nPlease make sure you have signed up first!')
      process.exit(1)
    }
    
    console.log(`✅ User found: ${user.name} (${user.id})`)
    console.log(`   Current role: ${user.role}`)
    
    if (user.role === 'ADMIN') {
      console.log('\n✅ User already has ADMIN role!')
      process.exit(0)
    }
    
    // Update to admin
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' }
    })
    
    console.log(`\n✅ Successfully updated role to ADMIN!`)
    console.log(`   Updated role: ${updatedUser.role}`)
    console.log(`\n📝 Next steps:`)
    console.log(`   1. Sign out from the app`)
    console.log(`   2. Sign back in`)
    console.log(`   3. You should now see the "Admin" link in the navbar`)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setAdminRole()
