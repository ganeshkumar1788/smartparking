const mongoose = require('mongoose');
require('dotenv').config();
const ParkingSpace = require('./src/models/ParkingSpace');

async function updateSpace() {
    await mongoose.connect(process.env.MONGODB_URI);
    await ParkingSpace.findByIdAndUpdate('69a0366cd891ca9a886c9861', {
        $set: {
            "liveStatus.cameraUrl": "http://localhost:5002/video_feed",
            "liveStatus.isCameraActive": true
        }
    });
    console.log("Space 69a0366cd891ca9a886c9861 updated with camera URL on PORT 5002");
    process.exit(0);
}

updateSpace();
