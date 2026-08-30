const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const {
  User,
  StudentProfile,
  Skill,
  Project,
  Certificate,
  Achievement,
  Education,
  Experience,
} = require('../models');

const autoSeed = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`[Seed] Database already contains ${userCount} user accounts. Preserving all existing users and data.`);
      return;
    }

    console.log('[Seed] Database is empty. Seeding initial demo accounts...');
    await performSeed(false);
  } catch (err) {
    console.error('[Seed] autoSeed error:', err.message);
  }
};

const performSeed = async (clearExisting = false) => {
  try {
    if (clearExisting) {
    console.log('[Seed] Clearing existing demo data...');
    await User.deleteMany({});
    await StudentProfile.deleteMany({});
    await Skill.deleteMany({});
    await Project.deleteMany({});
    await Certificate.deleteMany({});
    await Achievement.deleteMany({});
    await Education.deleteMany({});
    await Experience.deleteMany({});
  }

    // 1. Create Admin User
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@dsp.gov',
      password: 'admin123',
      role: 'admin',
      college: 'National Credential Authority',
    });
    console.log(`[Seed] Created Admin: ${admin.email} / admin123`);

    // 2. Create Recruiter User
    const recruiter = await User.create({
      name: 'Sarah Connor',
      email: 'recruiter@techhire.com',
      password: 'recruiter123',
      role: 'recruiter',
      college: 'TechHire Global Talent',
    });
    console.log(`[Seed] Created Recruiter: ${recruiter.email} / recruiter123`);

    console.log('\n===========================================');
    console.log(' SEED COMPLETED SUCCESSFULLY! ');
    console.log(' Credentials:');
    console.log(' 1. Admin:     admin@dsp.gov          / admin123');
    console.log(' 2. Recruiter: recruiter@techhire.com / recruiter123');
    console.log(' (Students register directly through the application)');
    console.log('===========================================\n');
  } catch (err) {
    console.error('[Seed] Error seeding database:', err);
    throw err;
  }
};

const seedData = async () => {
  await connectDB();
  await performSeed(true);
  await disconnectDB();
  process.exit(0);
};

if (require.main === module) {
  seedData();
}

module.exports = { seedData, autoSeed, performSeed };
