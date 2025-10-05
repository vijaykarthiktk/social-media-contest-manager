require('dotenv').config();
const mongoose = require('mongoose');
const Contest = require('./backend/models/Contest');
const Participant = require('./backend/models/Participant');
const User = require('./backend/models/User');

// Connect to MongoDB
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/contest_manager', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

// Clear all data
async function clearDatabase() {
    try {
        console.log('🧹 Clearing all data from MongoDB...\n');

        await connectDB();

        // Delete all data from collections
        const contestsDeleted = await Contest.deleteMany({});
        const participantsDeleted = await Participant.deleteMany({});
        const usersDeleted = await User.deleteMany({});

        console.log('✅ Database cleared successfully!\n');
        console.log('📊 Summary:');
        console.log(`   - Contests deleted: ${contestsDeleted.deletedCount}`);
        console.log(`   - Participants deleted: ${participantsDeleted.deletedCount}`);
        console.log(`   - Users deleted: ${usersDeleted.deletedCount}`);
        console.log('\n💡 Database is now empty. Run "node seed.js" to add sample data.\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error clearing database:', error);
        process.exit(1);
    }
}

// Run clear
clearDatabase();
