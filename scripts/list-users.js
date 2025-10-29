// Script to list all users in the database
require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function listUsers() {
  try {
    console.log('\n📋 Users in database:\n')
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    if (users.length === 0) {
      console.log('❌ No users found in database')
      console.log('\nPlease sign up first!')
      return
    }
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'No name'}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Created: ${new Date(user.createdAt).toLocaleString()}`)
      console.log('')
    })
    
    console.log(`\n✅ Total users: ${users.length}\n`)
    
    console.log('To set a user as admin, run:')
    console.log(`  node scripts/set-admin-role.js EMAIL\n`)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

listUsers()
