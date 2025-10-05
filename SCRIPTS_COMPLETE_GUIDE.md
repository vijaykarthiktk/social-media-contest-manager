# ✨ All Startup Scripts - Complete Guide

## 📁 Files Created

You now have these startup automation files in your project:

### 🎯 Main Scripts
- **`start.sh`** - Full automated setup + start (macOS/Linux) ⭐ **USE THIS FIRST**
- **`start.bat`** - Full automated setup + start (Windows)
- **`setup.sh`** - Setup only, no server start (macOS/Linux)
- **`stop.sh`** - Graceful shutdown (macOS/Linux)

### 📚 Documentation
- **`SCRIPTS_README.md`** - Quick guide for scripts
- **`STARTUP_GUIDE.md`** - Complete startup documentation (detailed)
- **`QUICK_REFERENCE.txt`** - One-page command cheat sheet (print this!)

---

## 🚀 GETTING STARTED (First Time)

### Option 1: Automated Script (Recommended ⭐)

**macOS/Linux:**
```bash
chmod +x start.sh
./start.sh
```

**Windows:**
```cmd
start.bat
```

The script will:
1. Check/install all requirements
2. Set up MongoDB
3. Create configuration files
4. Install dependencies
5. Ask if you want sample data (say "y")
6. Start the server automatically

**That's it! You're done.** 🎉

---

### Option 2: Manual NPM Commands

If scripts don't work for any reason:

```bash
# 1. Install dependencies
npm install

# 2. Start MongoDB (choose your OS)
brew services start mongodb-community  # macOS
sudo systemctl start mongodb           # Linux
net start MongoDB                      # Windows

# 3. Seed database (optional but recommended)
npm run seed

# 4. Start server
npm start              # Production mode
npm run dev            # Development mode
```

---

## 📋 What Each Script Does

### 🟢 start.sh / start.bat

**Full automated launch script**

```bash
./start.sh    # macOS/Linux
start.bat     # Windows
```

**Features:**
- ✅ Installs MongoDB if missing (macOS via Homebrew)
- ✅ Creates .env file with defaults
- ✅ Installs all npm packages
- ✅ Starts MongoDB service
- ✅ Optionally seeds sample data
- ✅ Starts Node.js server
- ✅ Shows access URLs and instructions

**Use this for:** First-time setup, quick restarts, demos

**Output example:**
```
🚀 Social Media Contest Manager - Startup Script
================================================

✓ Node.js v18.17.0 is installed
✓ MongoDB is already installed
✓ .env file exists
✓ Dependencies already installed
✓ MongoDB is already running
✓ MongoDB connection verified

Do you want to seed the database with sample data? (y/n) y
✓ Database seeded successfully

================================================
✓ Setup complete! Starting the application...
================================================

ℹ Server will start on: http://localhost:3000
ℹ Frontend pages:
  • Registration: frontend/index.html
  • Dashboard: frontend/dashboard.html
  • Admin Panel: frontend/admin.html

ℹ Press Ctrl+C to stop the server

> social-media-contest-manager@1.0.0 start
> node backend/server.js

🚀 Server running on port 3000
```

---

### ⚡ setup.sh

**Quick setup without starting server**

```bash
./setup.sh
```

**Features:**
- ✅ Installs MongoDB if missing
- ✅ Creates .env file
- ✅ Installs dependencies
- ✅ Starts MongoDB service
- ❌ Does NOT start the Node.js server
- ❌ Does NOT seed the database

**Use this for:** Initial setup when you want to configure before running

---

### 🔴 stop.sh

**Graceful shutdown**

```bash
./stop.sh
```

**Features:**
- ✅ Stops Node.js server
- ✅ Optionally stops MongoDB
- ✅ Cleans up processes

**Use this for:** Clean shutdown instead of Ctrl+C

**Output example:**
```
🛑 Social Media Contest Manager - Stop Script
==============================================

ℹ Stopping Node.js server...
✓ Node.js server stopped

Do you want to stop MongoDB as well? (y/n) n
ℹ MongoDB is still running

✓ Cleanup complete!
```

---

## 🎯 Common Workflows

### First Time Setup
```bash
./start.sh              # Run this
# Choose 'y' when asked to seed
# Server starts automatically
# Open frontend/index.html
```

### Daily Development
```bash
npm run dev             # Auto-restarts on file changes
```

### Quick Test/Demo
```bash
./start.sh              # Everything in one command
```

### Clean Shutdown
```bash
./stop.sh               # Graceful shutdown
# or just press Ctrl+C
```

### Reset Database
```bash
npm run seed            # Clears and reseeds
```

### Production Deployment
```bash
# Update .env for production
npm start               # Or use PM2
```

---

## 🌐 Access Points After Starting

Once the server is running:

### Backend API
- **Base URL:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/api/health
- **Contests:** http://localhost:3000/api/contests
- **Participants:** http://localhost:3000/api/participants
- **Analytics:** http://localhost:3000/api/analytics

### Frontend Pages
1. **Registration Form**
   - File: `frontend/index.html`
   - Open directly in browser

2. **Analytics Dashboard**
   - File: `frontend/dashboard.html`
   - Open directly in browser

3. **Admin Control Panel**
   - File: `frontend/admin.html`
   - Open directly in browser

---

## 🔧 Troubleshooting

### Issue: Scripts won't run (Permission denied)

**Solution (macOS/Linux):**
```bash
chmod +x start.sh setup.sh stop.sh
```

---

### Issue: MongoDB won't install (macOS)

**Solution:**
```bash
# Install Homebrew first
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then install MongoDB
brew tap mongodb/brew
brew install mongodb-community
```

---

### Issue: Port 3000 already in use

**Solution:**
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9        # macOS/Linux

netstat -ano | findstr :3000         # Windows (find PID)
taskkill /PID <PID> /F               # Windows (kill)
```

**Or change port in .env:**
```bash
PORT=3001
```

---

### Issue: MongoDB connection fails

**Check if running:**
```bash
pgrep mongod              # macOS/Linux
sc query MongoDB          # Windows
```

**Start manually:**
```bash
brew services start mongodb-community  # macOS
sudo systemctl start mongodb           # Linux
net start MongoDB                      # Windows
```

**Verify connection:**
```bash
mongosh                   # Should connect without errors
```

---

### Issue: npm install fails

**Solution:**
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

### Issue: Seed script fails

**Common causes:**
1. MongoDB not running
2. Wrong database name
3. Schema validation errors

**Solution:**
```bash
# Drop database and reseed
mongosh contest_manager --eval "db.dropDatabase()"
npm run seed
```

---

## 📊 Sample Data Details

Running `npm run seed` creates:

### 3 Sample Contests

1. **Summer Instagram Giveaway 2025**
   - Status: Active
   - Algorithm: Pure Random
   - ~60 participants

2. **Tech Product Launch Contest**
   - Status: Active
   - Algorithm: Weighted Random
   - ~45 participants

3. **Influencer Collaboration Contest**
   - Status: Draft
   - Algorithm: Priority Based
   - ~45 participants

### 150 Sample Participants

- Realistic names and emails
- Various social media platforms
- Different engagement scores
- Multiple stages (Registered, Qualified, Finalist)
- Low fraud scores (realistic data)
- Last 30 days registration dates

---

## ⚙️ Configuration

### Environment Variables (.env)

The startup script creates this automatically:

```bash
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/contest_manager

# Security
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Contest Settings
MAX_PARTICIPANTS_PER_CONTEST=10000
DEFAULT_NUMBER_OF_WINNERS=3

# Firebase (optional)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
FIREBASE_DATABASE_URL=
```

**⚠️ Important:** Change `JWT_SECRET` for production!

Generate secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🎓 For Exam/Demo/Presentation

### Quick Demo Flow

1. **Setup (1 minute)**
   ```bash
   ./start.sh
   # Say 'y' to seed
   ```

2. **Show Registration (2 minutes)**
   - Open `frontend/index.html`
   - Show contest selection
   - Register a participant
   - Demonstrate duplicate detection

3. **Show Dashboard (2 minutes)**
   - Open `frontend/dashboard.html`
   - Show live metrics
   - Explain stage flow
   - Show platform distribution

4. **Show Admin Panel (3 minutes)**
   - Open `frontend/admin.html`
   - View all participants
   - Select winners
   - Show fairness report

5. **Explain Algorithms (5 minutes)**
   - Refer to BUSINESS_REPORT.md
   - Explain 5 fairness algorithms
   - Show data structures used
   - Discuss time complexity

**Total: ~13 minutes for complete demo**

---

## 📚 Documentation Hierarchy

Use docs in this order:

1. **SCRIPTS_README.md** (this file)
   - Quick overview of all scripts
   - Common commands
   - Quick troubleshooting

2. **QUICK_REFERENCE.txt**
   - One-page cheat sheet
   - Print and keep handy
   - All commands at a glance

3. **STARTUP_GUIDE.md**
   - Detailed startup instructions
   - In-depth troubleshooting
   - Advanced configuration

4. **QUICKSTART.md**
   - Step-by-step beginner guide
   - Screenshots and examples
   - Common issues

5. **README.md**
   - Complete technical documentation
   - API reference
   - Architecture details

6. **BUSINESS_REPORT.md**
   - Algorithm explanations
   - Business analysis
   - ROI calculations

7. **PROJECT_STRUCTURE.md**
   - File organization
   - Component details
   - Data flow diagrams

---

## 🔄 Development Workflow

### Typical Day

```bash
# Morning: Start development
npm run dev

# Work on features...

# Test changes
# Browser auto-reloads

# Afternoon: Test with fresh data
npm run seed

# Continue development...

# Evening: Stop server
# Press Ctrl+C or ./stop.sh
```

### Adding New Features

```bash
# 1. Start development server
npm run dev

# 2. Make changes to files

# 3. Test in browser
# Server auto-restarts on changes

# 4. If database changes, reseed
npm run seed

# 5. Commit changes
git add .
git commit -m "Add new feature"
```

---

## 🚀 Production Deployment

### Using PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start backend/server.js --name contest-manager

# Auto-restart on reboot
pm2 startup
pm2 save

# View logs
pm2 logs contest-manager

# Restart
pm2 restart contest-manager

# Stop
pm2 stop contest-manager

# Remove
pm2 delete contest-manager
```

### Using Docker

```bash
# Build image
docker build -t contest-manager .

# Run container
docker run -d -p 3000:3000 --name contest-manager contest-manager

# View logs
docker logs -f contest-manager

# Stop
docker stop contest-manager
```

### Cloud Deployment

**Heroku:**
```bash
heroku create contest-manager
heroku addons:create mongolab
git push heroku main
```

**Railway:**
```bash
railway login
railway init
railway up
```

---

## 💡 Pro Tips

1. **Always seed database first time** - Gives you test data immediately

2. **Use `npm run dev` for development** - Auto-restarts on changes

3. **Keep MongoDB running** - Saves startup time

4. **Print QUICK_REFERENCE.txt** - Always have commands handy

5. **Test in multiple browsers** - Ensure compatibility

6. **Use admin panel for testing** - Quick winner selection

7. **Check terminal for errors** - All errors show in console

8. **Use MongoDB shell** - View data directly: `mongosh contest_manager`

---

## 📞 Quick Help

**Server won't start?**
- Check MongoDB is running: `pgrep mongod`
- Check port is free: `lsof -ti:3000`
- Check .env file exists

**Can't connect to database?**
- Verify MongoDB running: `mongosh`
- Check MONGODB_URI in .env
- Try restarting MongoDB

**Seed script fails?**
- Drop database first: `mongosh contest_manager --eval "db.dropDatabase()"`
- Check MongoDB connection
- Verify schema is correct

**Frontend not loading?**
- Check API_CONFIG in frontend/js/config.js
- Verify server is running
- Check browser console for errors

---

## 🎉 Success Checklist

After running startup script, verify:

- [ ] Server starts without errors
- [ ] MongoDB connects successfully
- [ ] Database has 3 contests
- [ ] Database has 150 participants
- [ ] Registration page opens
- [ ] Dashboard shows metrics
- [ ] Admin panel loads
- [ ] Can register new participant
- [ ] Duplicate detection works
- [ ] Can select winners

**All checked?** You're ready to go! 🚀

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| Total Scripts | 4 |
| Documentation Files | 7 |
| Lines of Script Code | ~400 |
| Setup Time | < 5 minutes |
| Prerequisites | Node.js, MongoDB |
| Supported OS | macOS, Linux, Windows |
| Auto-installs | MongoDB (macOS only) |

---

## 🔗 Related Files

All these work together:

```
Project Root/
├── start.sh              ← Main startup script
├── start.bat             ← Windows version
├── setup.sh              ← Setup only
├── stop.sh               ← Shutdown script
├── SCRIPTS_README.md     ← This file
├── STARTUP_GUIDE.md      ← Detailed guide
├── QUICK_REFERENCE.txt   ← Cheat sheet
├── package.json          ← npm scripts defined
├── .env                  ← Config (auto-created)
└── seed.js               ← Database seeding
```

---

## 🎯 Next Steps

1. **Run the startup script**
   ```bash
   ./start.sh
   ```

2. **Explore the application**
   - Try registration
   - View dashboard
   - Use admin panel

3. **Read documentation**
   - Start with QUICKSTART.md
   - Deep dive into README.md
   - Study BUSINESS_REPORT.md for algorithms

4. **Customize for your needs**
   - Modify .env settings
   - Adjust seed data
   - Customize frontend

5. **Deploy to production**
   - Update .env for production
   - Use PM2 or Docker
   - Deploy to cloud

---

**You're all set! 🎉**

Everything is automated and ready to use. Just run `./start.sh` and you're good to go!

For detailed help, see:
- **STARTUP_GUIDE.md** - Complete guide
- **QUICK_REFERENCE.txt** - Command cheat sheet
- **README.md** - Full documentation

---

**Made with ❤️ to make your life easier**
