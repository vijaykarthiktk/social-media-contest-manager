# 🚀 Startup Guide - Social Media Contest Manager

This guide explains how to use the automated startup scripts to set up and run the project.

---

## Quick Start (macOS/Linux)

### One Command Startup

```bash
chmod +x start.sh
./start.sh
```

This script will automatically:
1. ✅ Check Node.js installation
2. ✅ Check/Install MongoDB
3. ✅ Create .env file if missing
4. ✅ Install npm dependencies
5. ✅ Start MongoDB service
6. ✅ Seed the database (optional)
7. ✅ Start the application server

---

## Quick Start (Windows)

### One Command Startup

```cmd
start.bat
```

The script will guide you through the same setup process as the macOS/Linux version.

---

## What Each Script Does

### 🟢 `start.sh` / `start.bat` (Main Startup Script)

**Purpose:** Complete setup and launch of the application

**What it does:**
1. **System Check**
   - Verifies Node.js is installed
   - Checks for MongoDB installation
   - Installs MongoDB if missing (macOS via Homebrew)

2. **Configuration**
   - Creates `.env` file from template if missing
   - Sets default values for development

3. **Dependencies**
   - Installs npm packages if not already installed
   - Verifies all dependencies are present

4. **Database Setup**
   - Starts MongoDB service
   - Verifies database connection
   - Optionally seeds sample data

5. **Application Launch**
   - Starts the Node.js/Express server
   - Displays access URLs
   - Shows helpful information

**Output Example:**
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
  • Registration: http://localhost:3000/ or open frontend/index.html
  • Dashboard: frontend/dashboard.html
  • Admin Panel: frontend/admin.html

ℹ Press Ctrl+C to stop the server
```

---

### 🔴 `stop.sh` (Shutdown Script - macOS/Linux)

**Purpose:** Gracefully stop the application and MongoDB

**What it does:**
1. Stops the Node.js server process
2. Optionally stops MongoDB service
3. Cleans up running processes

**Usage:**
```bash
chmod +x stop.sh
./stop.sh
```

**Output Example:**
```
🛑 Social Media Contest Manager - Stop Script
==============================================

ℹ Stopping Node.js server...
✓ Node.js server stopped

Do you want to stop MongoDB as well? (y/n) y
ℹ Stopping MongoDB...
✓ MongoDB stopped

✓ Cleanup complete!
```

---

## Prerequisites

### macOS
- **Node.js** v14 or higher
- **Homebrew** (for MongoDB installation)
- **Terminal** access

The script will automatically install MongoDB via Homebrew if not present.

### Linux
- **Node.js** v14 or higher
- **MongoDB** (install manually or via package manager)
- **Bash shell**

### Windows
- **Node.js** v14 or higher
- **MongoDB Community Edition**
- **Command Prompt** or PowerShell with admin rights

---

## Manual Setup (If Scripts Don't Work)

If the automated scripts encounter issues, follow these manual steps:

### Step 1: Install MongoDB

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

**Windows:**
1. Download from https://www.mongodb.com/try/download/community
2. Install with default settings
3. Start MongoDB service from Services panel

### Step 2: Create Environment File

```bash
cp .env.example .env
```

Edit `.env` and update values as needed.

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Seed Database (Optional)

```bash
npm run seed
```

### Step 5: Start Server

```bash
npm start
```

or for development with auto-restart:

```bash
npm run dev
```

---

## Environment Variables

The startup script creates a `.env` file with these defaults:

```bash
# Server Configuration
PORT=3000                          # Server port
NODE_ENV=development               # Environment mode

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/contest_manager

# Security
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Contest Settings
MAX_PARTICIPANTS_PER_CONTEST=10000
DEFAULT_NUMBER_OF_WINNERS=3

# Firebase (Optional)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
FIREBASE_DATABASE_URL=
```

### Important Security Note

⚠️ **Change `JWT_SECRET` in production!** Use a strong random string:

```bash
# Generate a secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Accessing the Application

Once started, access these URLs:

### Backend API
- **Base URL:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/api/health

### Frontend Pages
1. **Registration Form**
   - File: `frontend/index.html`
   - URL: http://localhost:3000/ (if serving static files)
   - Direct: Open file in browser

2. **Analytics Dashboard**
   - File: `frontend/dashboard.html`
   - Direct: Open file in browser

3. **Admin Panel**
   - File: `frontend/admin.html`
   - Direct: Open file in browser

---

## Troubleshooting

### Issue: "MongoDB not found"

**Solution (macOS):**
```bash
brew tap mongodb/brew
brew install mongodb-community
```

**Solution (Linux):**
```bash
sudo apt-get update
sudo apt-get install mongodb
```

**Solution (Windows):**
Download and install from: https://www.mongodb.com/try/download/community

---

### Issue: "Port 3000 already in use"

**Find and kill the process:**

macOS/Linux:
```bash
lsof -ti:3000 | xargs kill -9
```

Windows:
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Or change the port in `.env`:
```bash
PORT=3001
```

---

### Issue: "MongoDB connection failed"

**Check if MongoDB is running:**

macOS:
```bash
brew services list | grep mongodb
```

Linux:
```bash
sudo systemctl status mongodb
```

Windows:
```cmd
sc query MongoDB
```

**Start MongoDB manually:**

macOS:
```bash
brew services start mongodb-community
```

Linux:
```bash
sudo systemctl start mongodb
```

Windows:
```cmd
net start MongoDB
```

---

### Issue: "npm install fails"

**Clear npm cache and retry:**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

### Issue: "Seed script fails"

**Possible causes:**
1. MongoDB not running
2. Database already seeded
3. Connection string incorrect

**Solution:**
1. Ensure MongoDB is running
2. Drop the database and reseed:

```bash
mongosh contest_manager --eval "db.dropDatabase()"
npm run seed
```

---

### Issue: "Permission denied" (macOS/Linux)

**Make scripts executable:**
```bash
chmod +x start.sh
chmod +x stop.sh
```

---

## Development Mode

For development with auto-restart on file changes:

```bash
npm run dev
```

This uses `nodemon` which watches for file changes and automatically restarts the server.

---

## Database Management

### View Data with MongoDB Shell

```bash
mongosh contest_manager
```

```javascript
// Show all collections
show collections

// View contests
db.contests.find().pretty()

// View participants
db.participants.find().pretty()

// Count documents
db.participants.countDocuments()

// Drop database (reset everything)
db.dropDatabase()
```

### Reset Database

```bash
# Connect to MongoDB
mongosh contest_manager

# Drop database
db.dropDatabase()

# Exit MongoDB shell
exit

# Reseed data
npm run seed
```

---

## Production Deployment

For production deployment, modify these settings:

### 1. Update .env file

```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/contest_manager
JWT_SECRET=<strong-random-secret>
```

### 2. Use Process Manager (PM2)

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start backend/server.js --name contest-manager

# View logs
pm2 logs contest-manager

# Restart
pm2 restart contest-manager

# Stop
pm2 stop contest-manager
```

### 3. Set up Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Script Customization

### Changing Default Port

Edit `start.sh` or `.env`:

```bash
# In .env
PORT=8080
```

### Auto-seeding without prompt

Edit `start.sh` and change this section:

```bash
# Replace the read prompt with:
print_info "Auto-seeding database..."
npm run seed
```

### Skip MongoDB installation check

Comment out the MongoDB installation section in `start.sh`:

```bash
# # Step 2: Check if MongoDB is installed
# print_info "Checking MongoDB installation..."
# ... (comment out this entire section)
```

---

## Automated Startup on System Boot

### macOS (launchd)

Create `~/Library/LaunchAgents/com.contestmanager.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.contestmanager</string>
    <key>ProgramArguments</key>
    <array>
        <string>/path/to/project/start.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

Load it:
```bash
launchctl load ~/Library/LaunchAgents/com.contestmanager.plist
```

### Linux (systemd)

Create `/etc/systemd/system/contest-manager.service`:

```ini
[Unit]
Description=Social Media Contest Manager
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/project
ExecStart=/usr/bin/node backend/server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable contest-manager
sudo systemctl start contest-manager
```

---

## Summary of Commands

### Start Application
```bash
./start.sh          # macOS/Linux
start.bat           # Windows
```

### Stop Application
```bash
./stop.sh           # macOS/Linux
# Windows: Press Ctrl+C in the command window
```

### Development Mode
```bash
npm run dev
```

### Reset Database
```bash
npm run seed
```

### View Logs
```bash
# If using PM2
pm2 logs contest-manager

# If running directly
# Logs appear in the terminal
```

---

## Getting Help

If you encounter issues:

1. **Check the logs** - Error messages usually indicate the problem
2. **Verify MongoDB** - Ensure it's running and accessible
3. **Check .env file** - Ensure all required variables are set
4. **Review documentation** - See README.md and QUICKSTART.md
5. **Test manually** - Try each step manually to identify the issue

---

## Next Steps

After successful startup:

1. ✅ Open frontend/index.html to test registration
2. ✅ Open frontend/dashboard.html to view analytics
3. ✅ Open frontend/admin.html for contest management
4. ✅ Review BUSINESS_REPORT.md for algorithm explanations
5. ✅ Check README.md for API documentation

---

**Your application is now ready to use! 🎉**

For more detailed information, see:
- `README.md` - Complete technical documentation
- `QUICKSTART.md` - Quick setup guide
- `BUSINESS_REPORT.md` - Algorithm explanations
- `PROJECT_STRUCTURE.md` - Architecture overview
