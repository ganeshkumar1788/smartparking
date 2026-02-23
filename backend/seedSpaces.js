require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User'); // Adjust if absolute path is needed
const ParkingSpace = require('./src/models/ParkingSpace');
const bcrypt = require('bcryptjs');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB for seeding parking spaces');

        // Create a fake host user if needed
        let fallbackHost = await User.findOne({ email: 'seedhost@smartpark.com' });
        if (!fallbackHost) {
            const password = await bcrypt.hash('password123', 10);
            fallbackHost = await User.create({
                name: 'System Host',
                email: 'seedhost@smartpark.com',
                password,
                role: 'host',
                phone: '555-0101',
                isActive: true
            });
            console.log('Created fallback host');
        }

        const sampleSpaces = [
            {
                hostId: fallbackHost._id,
                title: 'Connaught Place Premium Parking',
                description: 'Secure, covered parking space near CP',
                address: 'Connaught Place, New Delhi',
                latitude: 28.6315,
                longitude: 77.2167,
                pricePerHour: 5,
                vehicleType: 'car',
                features: ['cctv', 'covered', '24/7'],
                status: 'active',
                rating: 4.5
            },
            {
                hostId: fallbackHost._id,
                title: 'India Gate Visitor Slot',
                description: 'Open parking near India Gate lawns',
                address: 'Rajpath Area, New Delhi',
                latitude: 28.6129,
                longitude: 77.2295,
                pricePerHour: 2,
                vehicleType: 'car',
                features: ['open'],
                status: 'active',
                rating: 4.8
            },
            {
                hostId: fallbackHost._id,
                title: 'Lajpat Nagar Market Bike Spot',
                description: 'Dedicated two-wheeler parking',
                address: 'Central Market, Lajpat Nagar, New Delhi',
                latitude: 28.5684,
                longitude: 77.2435,
                pricePerHour: 1,
                vehicleType: 'bike',
                features: ['security'],
                status: 'active',
                rating: 4.0
            }
        ];

        // Wipe old seeds to prevent duplicates
        await ParkingSpace.deleteMany({ title: { $in: sampleSpaces.map(s => s.title) } });

        const createdSpaces = await ParkingSpace.insertMany(sampleSpaces);
        console.log(`Successfully seeded ${createdSpaces.length} parking spaces.`);

        // Log out the IDs if needed
        console.log("Sample Spaces:", createdSpaces.map(s => s.title));

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB disconnected');
        process.exit();
    }
};

seedData();
