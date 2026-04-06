const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');

async function findHost() {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findById('699b3fb15e77dad0c86541bc');
    console.log(JSON.stringify(user));
    process.exit(0);
}

findHost();
