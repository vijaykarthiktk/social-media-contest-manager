# Social Media Contest Manager - Project Structure

## 📂 Complete File Tree

```
social-media-contest-manager/
│
├── 📄 package.json                     # Project dependencies and scripts
├── 📄 .gitignore                       # Git ignore rules
├── 📄 .env.example                     # Environment variables template
├── 📄 README.md                        # Technical documentation
├── 📄 BUSINESS_REPORT.md               # Comprehensive business report
├── 📄 QUICKSTART.md                    # Quick setup guide
├── 📄 PROJECT_STRUCTURE.md             # This file
├── 📄 seed.js                          # Database seeding script
│
├── 📁 backend/                         # Backend API server
│   │
│   ├── 📁 config/                      # Configuration files
│   │   ├── 📄 database.js              # MongoDB connection setup
│   │   └── 📄 firebase.js              # Firebase initialization
│   │
│   ├── 📁 models/                      # Database schemas
│   │   ├── 📄 Contest.js               # Contest data model
│   │   │   • Fields: title, description, dates, limits
│   │   │   • Analytics: fairness scores, participants
│   │   │   • Status: Draft, Active, Completed, etc.
│   │   │
│   │   └── 📄 Participant.js           # Participant data model
│   │       • Fields: name, email, platform, stage
│   │       • Metrics: engagement, priority, fraud score
│   │       • Relationships: referrals, contest
│   │
│   ├── 📁 controllers/                 # Business logic
│   │   ├── 📄 contestController.js     # Contest CRUD operations
│   │   │   • createContest()
│   │   │   • getAllContests()
│   │   │   • selectWinners()
│   │   │   • getContestAnalytics()
│   │   │
│   │   ├── 📄 participantController.js # Participant management
│   │   │   • registerParticipant()
│   │   │   • bulkQualifyParticipants()
│   │   │   • updateParticipantStage()
│   │   │   • checkDuplicate()
│   │   │
│   │   └── 📄 analyticsController.js   # Analytics & reporting
│   │       • getPlatformAnalytics()
│   │       • getRetentionAnalytics()
│   │       • getFraudReport()
│   │       • getEngagementFunnel()
│   │
│   ├── 📁 routes/                      # API endpoints
│   │   ├── 📄 contestRoutes.js         # /api/contests/*
│   │   ├── 📄 participantRoutes.js     # /api/participants/*
│   │   └── 📄 analyticsRoutes.js       # /api/analytics/*
│   │
│   ├── 📁 services/                    # External services
│   │   └── 📄 firebaseService.js       # Firebase real-time sync
│   │       • syncParticipantRegistration()
│   │       • broadcastWinners()
│   │       • updateLiveMetrics()
│   │
│   ├── 📁 utils/                       # Utility functions & algorithms
│   │   ├── 📄 PriorityQueue.js         # Min-heap implementation
│   │   │   • enqueue() - O(log n)
│   │   │   • dequeue() - O(log n)
│   │   │   • peek() - O(1)
│   │   │
│   │   ├── 📄 HashUtils.js             # Hashing & duplicate detection
│   │   │   • generateParticipantHash() - SHA-256
│   │   │   • generateDeviceFingerprint()
│   │   │   • calculateFraudScore()
│   │   │   • isDuplicateHash() - O(1)
│   │   │
│   │   └── 📄 FairnessEngine.js        # Winner selection algorithms
│   │       • pureRandomSelection()      # Fisher-Yates
│   │       • weightedRandomSelection()  # Roulette wheel
│   │       • priorityBasedSelection()   # Heap-based
│   │       • timeBasedSelection()       # Stratified sampling
│   │       • hybridSelection()          # Multi-criteria
│   │       • calculateFairnessScore()
│   │       • generateFairnessReport()
│   │
│   └── 📄 server.js                    # Main server entry point
│       • Express app initialization
│       • Middleware setup
│       • Route mounting
│       • Error handling
│
└── 📁 frontend/                        # Frontend web interface
    │
    ├── 📁 css/                         # Stylesheets
    │   └── 📄 styles.css               # Main stylesheet (800+ lines)
    │       • Responsive design
    │       • Gradient backgrounds
    │       • Card components
    │       • Dashboard metrics
    │       • Animations
    │
    ├── 📁 js/                          # JavaScript files
    │   ├── 📄 config.js                # API configuration
    │   │   • BASE_URL
    │   │   • ENDPOINTS
    │   │   • Firebase config
    │   │
    │   ├── 📄 registration.js          # Registration form logic
    │   │   • loadActiveContests()
    │   │   • checkDuplicateEmail()
    │   │   • handleFormSubmit()
    │   │
    │   ├── 📄 dashboard.js             # Dashboard logic
    │   │   • loadContestData()
    │   │   • subscribeToRealtimeUpdates()
    │   │   • updateMetrics()
    │   │   • displayCharts()
    │   │
    │   └── 📄 admin.js                 # Admin panel logic
    │       • createContest()
    │       • bulkQualify()
    │       • selectWinners()
    │       • displayAnalytics()
    │
    ├── 📄 index.html                   # Registration page
    │   • Contest selection
    │   • Registration form
    │   • Duplicate warnings
    │   • Fairness information
    │
    ├── 📄 dashboard.html               # Analytics dashboard
    │   • Live metrics
    │   • Stage flow visualization
    │   • Platform distribution
    │   • Winner announcements
    │   • Activity feed
    │
    └── 📄 admin.html                   # Admin control panel
        • Contest creation
        • Status management
        • Bulk operations
        • Winner selection
        • Fraud reports
```

## 🔑 Key Components Explained

### Backend Components

#### Models (Database Schemas)
- **Contest.js**: Defines contest structure with status tracking, fairness settings, and analytics
- **Participant.js**: Tracks participants through stages with engagement and fraud metrics

#### Controllers (Business Logic)
- **contestController.js**: Handles contest lifecycle from creation to winner selection
- **participantController.js**: Manages participant registration, qualification, and workflow
- **analyticsController.js**: Provides insights through MongoDB aggregation pipelines

#### Utils (Algorithms & Data Structures)
- **PriorityQueue.js**: Heap-based queue for efficient participant qualification (O(log n))
- **HashUtils.js**: SHA-256 hashing for duplicate detection and fraud prevention (O(1))
- **FairnessEngine.js**: Five different winner selection algorithms with provable fairness

### Frontend Components

#### Pages
- **index.html**: Public-facing registration interface
- **dashboard.html**: Real-time analytics and metrics display
- **admin.html**: Administrative controls and operations

#### JavaScript Modules
- **config.js**: Centralized API and Firebase configuration
- **registration.js**: Form handling with real-time duplicate detection
- **dashboard.js**: Live updates using Firebase and polling fallback
- **admin.js**: Contest management and winner selection interface

## 📊 Data Flow

### 1. Participant Registration Flow
```
User (Frontend) 
    → registration.js
    → POST /api/participants/register
    → participantController.registerParticipant()
    → HashUtils.generateParticipantHash()
    → HashUtils.calculateFraudScore()
    → Participant.save() (MongoDB)
    → FirebaseService.syncParticipantRegistration()
    → Response to User
```

### 2. Winner Selection Flow
```
Admin (Frontend)
    → admin.js
    → POST /api/contests/:id/select-winners
    → contestController.selectWinners()
    → Participant.find() (Get qualified)
    → FairnessEngine.pureRandomSelection()
    → Participant.updateMany() (Mark as winners)
    → Contest.update() (Add winners, fairness score)
    → FirebaseService.broadcastWinners()
    → Response to Admin
```

### 3. Analytics Flow
```
Dashboard (Frontend)
    → dashboard.js
    → GET /api/analytics/funnel
    → analyticsController.getEngagementFunnel()
    → Participant.aggregate() (MongoDB pipeline)
    → Calculate conversion rates
    → Response with analytics data
    → dashboard.js displays charts
```

## 🎯 Algorithm Implementations

### Priority Queue (Min-Heap)
- **File**: `backend/utils/PriorityQueue.js`
- **Operations**:
  - Insert: O(log n)
  - Extract min: O(log n)
  - Peek: O(1)
- **Usage**: Qualifying top participants based on engagement + time

### Hash Table (Duplicate Detection)
- **File**: `backend/utils/HashUtils.js`
- **Hash Function**: SHA-256
- **Collision Probability**: < 10^-60
- **Lookup Time**: O(1)
- **Usage**: Preventing duplicate registrations

### Random Selection (Fisher-Yates)
- **File**: `backend/utils/FairnessEngine.js`
- **Algorithm**: Fisher-Yates shuffle
- **Randomness**: crypto.randomBytes() (cryptographically secure)
- **Time Complexity**: O(n)
- **Fairness**: Perfect (1/n probability per participant)

## 📈 Database Schema Overview

### Contest Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  startDate: Date,
  endDate: Date,
  status: Enum['Draft', 'Active', 'Paused', 'Completed'],
  maxParticipants: Number,
  currentParticipants: Number,
  numberOfWinners: Number,
  fairnessAlgorithm: Enum[...],
  winners: [{participantId, selectedAt, prize}],
  analytics: {
    totalRegistrations: Number,
    qualifiedParticipants: Number,
    fairnessScore: Number,
    duplicatesDetected: Number,
    fraudAttempts: Number
  }
}
```

### Participant Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  contestId: ObjectId (ref: Contest),
  platform: Enum['Instagram', 'Twitter', ...],
  stage: Enum['Registered', 'Qualified', 'Finalist', 'Winner'],
  uniqueHash: String (indexed),
  deviceFingerprint: String,
  fraudScore: Number (0-100),
  engagementScore: Number,
  priority: Number,
  referrals: [ObjectId],
  referredBy: ObjectId,
  registrationDate: Date
}
```

## 🔐 Security Features

1. **Helmet.js**: Security headers
2. **CORS**: Cross-Origin Resource Sharing control
3. **Rate Limiting**: 100 requests per 15 minutes per IP
4. **Input Validation**: All user inputs validated
5. **Hash-based Detection**: Prevents duplicates and fraud
6. **Device Fingerprinting**: Tracks suspicious patterns

## 🚀 Performance Optimizations

1. **Database Indexing**:
   - Contest: status, campaignId
   - Participant: uniqueHash, contestId+email, contestId+stage

2. **Aggregation Pipelines**: Efficient analytics queries

3. **O(1) Lookups**: Hash-based duplicate detection

4. **O(log n) Operations**: Priority queue for qualifications

5. **Real-time Sync**: Firebase for instant updates (optional)

## 📚 External Dependencies

### Production Dependencies
```json
{
  "express": "^4.18.2",        // Web server
  "mongoose": "^7.5.0",        // MongoDB ODM
  "firebase-admin": "^11.10.1", // Firebase SDK
  "dotenv": "^16.3.1",         // Environment variables
  "cors": "^2.8.5",            // CORS handling
  "helmet": "^7.0.0",          // Security
  "bcryptjs": "^2.4.3",        // Hashing
  "uuid": "^9.0.0",            // Unique IDs
  "express-rate-limit": "^6.10.0", // Rate limiting
  "morgan": "^1.10.0"          // Logging
}
```

### Development Dependencies
```json
{
  "nodemon": "^3.0.1"          // Auto-restart server
}
```

## 🎓 Academic Concepts Demonstrated

| Concept | Implementation | File Location |
|---------|---------------|---------------|
| **Heap** | Priority Queue | utils/PriorityQueue.js |
| **Hash Table** | Duplicate Detection | utils/HashUtils.js |
| **Sorting** | Priority-based Selection | utils/FairnessEngine.js |
| **Randomization** | Fisher-Yates Shuffle | utils/FairnessEngine.js |
| **Aggregation** | Analytics Pipelines | controllers/analyticsController.js |
| **Graph** | Referral Network | models/Participant.js (referrals) |
| **REST API** | HTTP Endpoints | routes/*.js |
| **Real-time Sync** | Firebase Integration | services/firebaseService.js |

---

**Total Lines of Code**: ~4,500+  
**Languages**: JavaScript (Node.js), HTML5, CSS3  
**Database**: MongoDB (NoSQL)  
**Architecture**: MVC (Model-View-Controller)  

This structure demonstrates production-ready code organization with clear separation of concerns, scalable architecture, and comprehensive documentation.
