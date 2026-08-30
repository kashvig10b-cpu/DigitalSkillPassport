const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
require('dotenv').config();
const { connectDB } = require('./config/db');
const { User } = require('./models');

async function changeAdminPassword() {
  const newPassword = process.argv[2];

  if (!newPassword) {
    console.error('\n❌ Please provide a new password.');
    console.log('Usage: node changeAdminPassword.js <your_new_password>');
    console.log('Example: node changeAdminPassword.js mySecretPass123\n');
    process.exit(1);
  }

  if (newPassword.length < 6) {
    console.error('\n❌ Password must be at least 6 characters long.\n');
    process.exit(1);
  }

  try {
    await connectDB();

    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('\n❌ No admin account found in the database.\n');
      process.exit(1);
    }

    // Set new password (the pre("save") hook will hash it automatically)
    admin.password = newPassword;
    await admin.save();

    console.log('\n=============================================');
    console.log('✅ Admin password updated successfully!');
    console.log(`👤 Admin Email   : ${admin.email}`);
    console.log(`🔑 New Password  : ${newPassword}`);
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error updating admin password:', error.message);
    process.exit(1);
  }
}

changeAdminPassword();
