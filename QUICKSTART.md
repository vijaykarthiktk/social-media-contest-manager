# Quick Start Guide

## Prerequisites Check

Before starting, make sure you have:
- [ ] Node.js installed (v14 or higher)
- [ ] MongoDB installed and running
- [ ] A text editor or IDE

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages:
- express (API server)
- mongoose (MongoDB)
- firebase-admin (real-time features)
- And more...

### 2. Setup Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your settings (optional for basic usage)
# MongoDB will use default localhost if not configured
```

### 3. Start MongoDB

**macOS (with Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Windows:**
```bash
# MongoDB should start automatically
# Or run: net start MongoDB
```

**Verify MongoDB is running:**
```bash
# Try connecting
mongosh
# You should see: "Connected to: mongodb://127.0.0.1:27017"
```

### 4. Seed Sample Data (Optional but Recommended)

```bash
npm run seed
```

This creates:
- 3 sample contests
- 150 sample participants
- Various engagement levels

### 5. Start the Server

```bash
# Development mode (auto-restart on changes)
npm run dev

# Or production mode
npm start
```

You should see:
```
✅ MongoDB Connected
✅ Server running on http://localhost:3000
```

### 6. Open the Application

**Option A: Through Server (Recommended)**
- Open your browser to: http://localhost:3000/

**Option B: Direct File Access**
- Open `frontend/index.html` in your browser
- Open `frontend/dashboard.html` for analytics
- Open `frontend/admin.html` for admin controls

## Quick Test

### Test 1: View Contests
1. Open http://localhost:3000/api/contests
2. You should see JSON with contest data

### Test 2: Register a Participant
1. Open `frontend/index.html`
2. Select a contest
3. Fill in the form
4. Click "Register for Contest"
5. You should see a success message

### Test 3: View Dashboard
1. Open `frontend/dashboard.html`
2. Select a contest from dropdown
3. See live metrics and analytics

### Test 4: Admin Panel
1. Open `frontend/admin.html`
2. Create a new contest
3. Select an existing contest
4. Try qualifying participants
5. Select winners

## Common Issues & Solutions

### Issue: "MongoDB connection error"
**Solution:**
```bash
# Make sure MongoDB is running
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux

# Check if MongoDB is accessible
mongosh
```

### Issue: "Port 3000 already in use"
**Solution:**
```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process (replace PID with actual process ID)
kill -9 <PID>

# Or change port in .env
PORT=3001
```

### Issue: "Cannot find module"
**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Issue: "Firebase not initialized"
**This is OK!** Firebase is optional. The app works perfectly without it.
You'll just miss real-time features. To enable:
1. Create a Firebase project
2. Add credentials to `.env`
3. Restart the server

## API Testing with cURL

### Create a Contest
```bash
curl -X POST http://localhost:3000/api/contests \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Contest",
    "description": "Testing the system",
    "startDate": "2025-01-01T00:00:00Z",
    "endDate": "2025-12-31T23:59:59Z",
    "numberOfWinners": 1,
    "status": "Active"
  }'
```

### Register a Participant
```bash
curl -X POST http://localhost:3000/api/participants/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+1234567890",
    "socialMediaHandle": "@testuser",
    "platform": "Instagram",
    "contestId": "YOUR_CONTEST_ID_HERE"
  }'
```

### Get Analytics
```bash
curl http://localhost:3000/api/analytics/platform
```

## Development Workflow

### Making Changes
1. Edit files in `backend/` or `frontend/`
2. Server auto-restarts (if using `npm run dev`)
3. Refresh browser to see frontend changes

### Viewing Logs
```bash
# Server logs appear in terminal
# MongoDB logs:
tail -f /usr/local/var/log/mongodb/mongo.log  # macOS
```

### Database Management
```bash
# Connect to MongoDB shell
mongosh

# Switch to contest database
use contest-manager

# View all contests
db.contests.find().pretty()

# View all participants
db.participants.find().pretty()

# Clear all data
db.contests.deleteMany({})
db.participants.deleteMany({})
```

## Next Steps

1. **Explore the Frontend**
   - Try registering for different contests
   - Check duplicate detection
   - View live dashboard updates

2. **Test Admin Features**
   - Create custom contests
   - Qualify participants
   - Select winners with different algorithms

3. **Analyze Data**
   - View platform analytics
   - Generate fraud reports
   - Check engagement funnels

4. **Customize**
   - Modify fairness algorithms in `backend/utils/FairnessEngine.js`
   - Change UI styling in `frontend/css/styles.css`
   - Add new features!

## Need Help?

- Check `README.md` for detailed documentation
- Read `BUSINESS_REPORT.md` for algorithm explanations
- Review code comments for implementation details

## Stopping the Application

```bash
# Stop the server: Press Ctrl+C in terminal

# Stop MongoDB (optional)
brew services stop mongodb-community  # macOS
sudo systemctl stop mongod            # Linux
```

---

**Happy Contest Management! 🎉**
