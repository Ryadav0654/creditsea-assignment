import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { connectDB } from './config/db.js'
import { User } from './model/User.js'

const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@lms.com',
    password: 'Admin@123',
    role: 'admin',
  },
  {
    name: 'Sales Executive',
    email: 'sales@lms.com',
    password: 'Sales@123',
    role: 'sales',
  },
  {
    name: 'Sanction Officer',
    email: 'sanction@lms.com',
    password: 'Sanction@123',
    role: 'sanction',
  },
  {
    name: 'Disburse Officer',
    email: 'disburse@lms.com',
    password: 'Disburse@123',
    role: 'disbursement',
  },
  {
    name: 'Collection Agent',
    email: 'collection@lms.com',
    password: 'Collect@123',
    role: 'collection',
  },
  {
    name: 'Test Borrower',
    email: 'borrower@lms.com',
    password: 'Borrower@123',
    role: 'borrower',
  },
] as const

async function seed() {
  await connectDB()
  console.log('Seeding users...')

  for (const user of seedUsers) {
    const existing = await User.findOne({ email: user.email })
    if (existing) {
      console.log(`${user.email} already exists — skipping`)
      continue
    }
    const hashed = await bcrypt.hash(user.password, 12)
    await User.create({
      name: user.name,
      email: user.email,
      password: hashed,
      role: user.role,
    })
    console.log(`Created ${user.role}: ${user.email} / ${user.password}`)
  }

  console.log('\nSeed complete!\n')
  console.table(
    seedUsers.map(({ email, password, role }) => ({
      role,
      email,
      password,
    }))
  )
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
