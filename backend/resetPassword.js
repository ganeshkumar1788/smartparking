const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./src/models/User');

async function resetPassword() {
    await mongoose.connect(process.env.MONGODB_URI);
    const passwordHash = await bcrypt.hash('password123', 10);
    await User.findByIdAndUpdate('69a04543981fa006187238c1', { passwordHash });
    console.log("Password reset to password123 for anil@gmail.com");
    process.exit(0);
}

resetPassword();
