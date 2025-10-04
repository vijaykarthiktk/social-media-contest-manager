# Social Media Contest Manager with Fairness

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)
![MongoDB](https://img.shields.io/badge/MongoDB-4.4%2B-green)
![License](https://img.shields.io/badge/license-MIT-orange)

A comprehensive web application for managing social media contests with a strong emphasis on fairness, transparency, and fraud prevention.

## 🎯 Project Overview

This system ensures fair participation, selection, and results in social media contests through:
- **Advanced duplicate detection** using cryptographic hashing
- **Multiple fairness algorithms** with provable randomness
- **Real-time fraud detection** and prevention
- **Transparent workflow** from registration to winner selection
- **Live analytics dashboard** powered by MongoDB aggregation and Firebase

## ✨ Core Features

### 1. Contest Registration & Lead Capture
- ✅ Multi-platform registration (Instagram, Twitter, Facebook, LinkedIn, TikTok, YouTube)
- ✅ Real-time duplicate detection using SHA-256 hashing
- ✅ Device fingerprinting for fraud prevention
- ✅ Email/phone validation
- ✅ Referral system for viral growth

### 2. Fairness Algorithms
Five provably fair winner selection algorithms:

| Algorithm | Description | Use Case |
|-----------|-------------|----------|
| **Pure Random** | Cryptographically secure random selection | Equal opportunity contests |
| **Weighted Random** | Engagement-based probability | Reward active participants |
| **Priority-Based** | Queue-based transparent criteria | Time + engagement hybrid |
| **Time-Based** | Stratified sampling across registration windows | Fair time distribution |
| **Hybrid** | Multi-criteria balanced approach | Complex requirements |

### 3. Contest Workflow
Participants move through stages:
```
Registered → Qualified → Finalist → Winner
```
- Priority queue for qualification (O(log n) operations)
- Fraud scoring at each stage
- Admin controls for workflow management

### 4. Real-Time Dashboard
- 📊 Live participant count
- 📈 Engagement metrics
- 🎯 Fairness scores (0-100)
- 🏆 Winner announcements
- 📱 Platform distribution
- ⚡ Activity feed

### 5. Analytics & Insights
MongoDB aggregation pipelines for:
- Engagement funnel analysis
- Retention tracking across contests
- Fraud detection reports
- Platform performance metrics
- Time-series analytics
- Referral network analysis

### 6. Operations Module
- Campaign performance tracking
- Multi-contest management
- Duplicate participant detection
- IP and device fingerprint analysis

## 🏗️ Architecture

```
social-media-contest-manager/
├── backend/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── firebase.js          # Firebase initialization
│   ├── controllers/
│   │   ├── contestController.js
│   │   ├── participantController.js
│   │   └── analyticsController.js
│   ├── models/
│   │   ├── Contest.js           # Contest schema
│   │   └── Participant.js       # Participant schema
│   ├── routes/
│   │   ├── contestRoutes.js
│   │   ├── participantRoutes.js
│   │   └── analyticsRoutes.js
│   ├── services/
│   │   └── firebaseService.js   # Real-time sync
│   ├── utils/
│   │   ├── PriorityQueue.js     # Heap implementation
│   │   ├── HashUtils.js         # Duplicate detection
│   │   └── FairnessEngine.js    # Winner selection algorithms
│   └── server.js
├── frontend/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── config.js
│   │   ├── registration.js
│   │   ├── dashboard.js
│   │   └── admin.js
│   ├── index.html               # Registration form
│   ├── dashboard.html           # Analytics dashboard
│   └── admin.html               # Admin panel
├── package.json
├── .env.example
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Firebase account (optional, for real-time features)

### Installation

1. **Clone or extract the project**
   ```bash
   cd /Users/vijaykarthik/Programming/Sem-3/Exam
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/contest-manager
   
   # Optional Firebase config
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-client-email
   FIREBASE_PRIVATE_KEY=your-private-key
   FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
   ```

4. **Start MongoDB**
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Or run manually
   mongod --dbpath /usr/local/var/mongodb
   ```

5. **Start the server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   - Registration: http://localhost:3000/ or open `frontend/index.html`
   - Dashboard: http://localhost:3000/dashboard.html
   - Admin: http://localhost:3000/admin.html
   - API: http://localhost:3000/api/health

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Contest Endpoints

#### Create Contest
```http
POST /contests
Content-Type: application/json

{
  "title": "Summer Giveaway 2025",
  "description": "Win amazing prizes",
  "startDate": "2025-06-01T00:00:00Z",
  "endDate": "2025-06-30T23:59:59Z",
  "maxParticipants": 10000,
  "numberOfWinners": 3,
  "fairnessAlgorithm": "PureRandom",
  "status": "Active"
}
```

#### Get All Contests
```http
GET /contests?status=Active&limit=50&page=1
```

#### Get Contest by ID
```http
GET /contests/:id
```

#### Select Winners
```http
POST /contests/:id/select-winners
Content-Type: application/json

{
  "algorithm": "PureRandom",
  "count": 3
}
```

### Participant Endpoints

#### Register Participant
```http
POST /participants/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "socialMediaHandle": "@johndoe",
  "platform": "Instagram",
  "contestId": "contest_id_here"
}
```

#### Get Participants
```http
GET /participants?contestId=xxx&stage=Registered&limit=100
```

#### Check Duplicate
```http
POST /participants/check-duplicate
Content-Type: application/json

{
  "email": "john@example.com",
  "phone": "+1234567890",
  "contestId": "contest_id_here"
}
```

#### Bulk Qualify
```http
POST /participants/bulk-qualify
Content-Type: application/json

{
  "contestId": "contest_id_here",
  "count": 100
}
```

### Analytics Endpoints

#### Platform Analytics
```http
GET /analytics/platform
```

#### Fraud Report
```http
GET /analytics/fraud?contestId=xxx
```

#### Engagement Funnel
```http
GET /analytics/funnel?contestId=xxx
```

#### Campaign Performance
```http
GET /analytics/campaigns
```

## 🔒 Fairness Implementation

### Duplicate Detection
- **Hash-based identification**: SHA-256 of email + phone + contestId
- **O(1) lookup** using HashMap
- **Device fingerprinting**: IP + User-Agent hashing
- **Fraud scoring**: 0-100 based on multiple factors

### Random Selection Algorithm
```javascript
// Pure Random with Cryptographic Security
function pureRandomSelection(participants, count) {
  // Fisher-Yates shuffle with crypto.randomBytes
  // Ensures each participant has exactly 1/n probability
  // Verifiable using seed for transparency
}
```

### Priority Queue for Qualification
```javascript
// Min-Heap based priority queue
// O(log n) insertion and removal
// Criteria: engagement score + registration time
class PriorityQueue {
  enqueue(participant) // O(log n)
  dequeue() // O(log n)
  peek() // O(1)
}
```

### Fraud Detection
Fraud score calculation:
- Duplicate email: +40 points
- Multiple registrations from same device: +30 points
- Suspicious IP patterns: +20 points
- Rapid successive registrations: +10 points

Participants with fraud score > 70 are flagged and excluded from winner selection.

## 📊 Data Structures Used

| Structure | Implementation | Use Case | Time Complexity |
|-----------|----------------|----------|-----------------|
| **Priority Queue** | Min-Heap | Participant qualification | O(log n) |
| **Hash Map** | SHA-256 + Map | Duplicate detection | O(1) |
| **Graph** | Adjacency List | Referral network (optional) | O(V + E) |
| **Array** | Native JS | Participant pools | O(n) |

## 🎓 Academic Concepts Demonstrated

### 1. Data Structures
- **Heap**: Priority queue for fair participant selection
- **Hash Table**: O(1) duplicate detection
- **Tree**: MongoDB document structure
- **Graph**: Referral relationships (adjacency list)

### 2. Algorithms
- **Fisher-Yates Shuffle**: Unbiased random permutation
- **Cryptographic Hashing**: SHA-256 for data integrity
- **Aggregation Pipelines**: Data analysis and reporting
- **Sorting**: Priority-based participant ordering

### 3. System Design
- **RESTful API**: Clear endpoint structure
- **Database Indexing**: Optimized queries
- **Real-time Sync**: Firebase integration
- **Scalability**: Modular architecture

## 🧪 Testing the System

### 1. Create a Contest
```bash
curl -X POST http://localhost:3000/api/contests \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Contest",
    "description": "Testing fairness",
    "startDate": "2025-01-01T00:00:00Z",
    "endDate": "2025-12-31T23:59:59Z",
    "numberOfWinners": 3,
    "fairnessAlgorithm": "PureRandom",
    "status": "Active"
  }'
```

### 2. Register Participants
Use the frontend form or API to register multiple participants.

### 3. Qualify Participants
```bash
curl -X POST http://localhost:3000/api/participants/bulk-qualify \
  -H "Content-Type: application/json" \
  -d '{
    "contestId": "YOUR_CONTEST_ID",
    "count": 50
  }'
```

### 4. Select Winners
```bash
curl -X POST http://localhost:3000/api/contests/YOUR_CONTEST_ID/select-winners \
  -H "Content-Type: application/json" \
  -d '{
    "algorithm": "PureRandom",
    "count": 3
  }'
```

## 🔧 Firebase Setup (Optional)

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Realtime Database
3. Generate service account key:
   - Project Settings → Service Accounts → Generate New Private Key
4. Add credentials to `.env` or save as `firebase-credentials.json`
5. Update Firebase security rules for development:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```

## 📈 Engagement Strategy: Acquisition → Loyalty

### Phase 1: Acquisition
- Multi-platform registration
- Low barrier to entry
- Viral referral system

### Phase 2: Engagement
- Social media interactions tracked
- Engagement scores increase chances
- Community building

### Phase 3: Retention
- Regular contests maintain interest
- Historical engagement matters
- Returning participant benefits

### Phase 4: Loyalty
- VIP status for frequent participants
- Early access to new contests
- Exclusive rewards

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check MongoDB status
brew services list

# Restart MongoDB
brew services restart mongodb-community
```

### Port Already in Use
```bash
# Find process on port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Firebase Not Working
The app works perfectly without Firebase - it's optional for real-time features.

## 📝 License

MIT License - Feel free to use for educational purposes.

## 🤝 Contributing

This is an academic project. Contributions welcome for educational improvements.

## 📧 Support

For questions or issues, please refer to the Business Report document for detailed explanations.

---

**Built with ❤️ for fair and transparent contest management**
