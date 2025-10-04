require('dotenv').config();
const mongoose = require('mongoose');
const Contest = require('./backend/models/Contest');
const Participant = require('./backend/models/Participant');
const HashUtils = require('./backend/utils/HashUtils');

// Sample data
const platforms = ['Instagram', 'Twitter', 'Facebook', 'LinkedIn', 'TikTok', 'YouTube'];
const firstNames = ['John', 'Jane', 'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

// Connect to MongoDB
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/contest-manager', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

// Generate sample contests
async function generateContests() {
    console.log('\n📋 Generating sample contests...');

    const contests = [
        {
            title: 'Summer Instagram Giveaway 2025',
            description: 'Win amazing prizes by participating in our summer giveaway! Follow, like, and share to increase your chances.',
            startDate: new Date('2025-06-01'),
            endDate: new Date('2025-06-30'),
            maxParticipants: 5000,
            numberOfWinners: 3,
            status: 'Active',
            fairnessAlgorithm: 'PureRandom',
            platforms: ['Instagram', 'Twitter', 'Facebook'],
            campaignId: 'SUMMER2025',
            duplicateCheckEnabled: true,
            fraudDetectionEnabled: true,
            engagementWeights: {
                referrals: 10,
                socialShares: 5,
                comments: 3,
                likes: 1
            }
        },
        {
            title: 'Tech Product Launch Contest',
            description: 'Be among the first to try our new product! Engage with our brand and stand a chance to win.',
            startDate: new Date('2025-07-01'),
            endDate: new Date('2025-07-31'),
            maxParticipants: 10000,
            numberOfWinners: 5,
            status: 'Active',
            fairnessAlgorithm: 'WeightedRandom',
            platforms: ['Twitter', 'LinkedIn', 'YouTube'],
            campaignId: 'TECHLAUNCH',
            duplicateCheckEnabled: true,
            fraudDetectionEnabled: true
        },
        {
            title: 'Influencer Collaboration Contest',
            description: 'Partner with us! Show your creativity and win exciting collaboration opportunities.',
            startDate: new Date('2025-08-01'),
            endDate: new Date('2025-08-31'),
            maxParticipants: 3000,
            numberOfWinners: 10,
            status: 'Draft',
            fairnessAlgorithm: 'Hybrid',
            platforms: ['Instagram', 'TikTok', 'YouTube'],
            campaignId: 'INFLUENCER2025',
            duplicateCheckEnabled: true,
            fraudDetectionEnabled: true
        }
    ];

    const createdContests = await Contest.insertMany(contests);
    console.log(`✅ Created ${createdContests.length} contests`);
    return createdContests;
}

// Generate sample participants
async function generateParticipants(contests, count = 100) {
    console.log(`\n👥 Generating ${count} sample participants...`);

    const participants = [];

    for (let i = 0; i < count; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const name = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
        const phone = `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`;
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        const contest = contests[Math.floor(Math.random() * contests.length)];

        // Generate unique hash
        const uniqueHash = HashUtils.generateParticipantHash(email, phone, contest._id);

        // Generate engagement score (weighted towards higher values)
        const engagementScore = Math.floor(Math.random() * 50) + Math.floor(Math.random() * 50);

        // Calculate priority
        const priority = 50 + Math.floor(engagementScore / 2);

        // Determine stage (most are registered, some qualified)
        let stage = 'Registered';
        const rand = Math.random();
        if (rand > 0.7) stage = 'Qualified';
        if (rand > 0.9) stage = 'Finalist';

        participants.push({
            name,
            email,
            phone,
            socialMediaHandle: `@${firstName.toLowerCase()}${lastName.toLowerCase()}`,
            platform,
            contestId: contest._id,
            uniqueHash,
            engagementScore,
            priority,
            stage,
            fraudScore: Math.floor(Math.random() * 30), // Low fraud scores
            ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            registrationDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Last 30 days
        });
    }

    const createdParticipants = await Participant.insertMany(participants);
    console.log(`✅ Created ${createdParticipants.length} participants`);

    // Update contest participant counts
    for (const contest of contests) {
        const participantCount = createdParticipants.filter(
            p => p.contestId.toString() === contest._id.toString()
        ).length;

        await Contest.findByIdAndUpdate(contest._id, {
            currentParticipants: participantCount,
            'analytics.totalRegistrations': participantCount,
            'analytics.qualifiedParticipants': createdParticipants.filter(
                p => p.contestId.toString() === contest._id.toString() && p.stage === 'Qualified'
            ).length
        });
    }

    console.log('✅ Updated contest statistics');
}

// Main seed function
async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...\n');

        await connectDB();

        // Clear existing data
        console.log('🧹 Clearing existing data...');
        await Contest.deleteMany({});
        await Participant.deleteMany({});
        console.log('✅ Database cleared\n');

        // Generate new data
        const contests = await generateContests();
        await generateParticipants(contests, 150);

        console.log('\n✨ Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - Contests: ${contests.length}`);
        console.log(`   - Participants: ${await Participant.countDocuments()}`);
        console.log(`   - Active Contests: ${contests.filter(c => c.status === 'Active').length}`);

        console.log('\n🚀 You can now:');
        console.log('   1. Start the server: npm start');
        console.log('   2. Open frontend/index.html in a browser');
        console.log('   3. View the dashboard at frontend/dashboard.html');
        console.log('   4. Access admin panel at frontend/admin.html\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

// Run seed
seedDatabase();
