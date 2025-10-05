# 🚀 Quick Startup Scripts

This folder includes automated scripts to quickly set up and run the Social Media Contest Manager.

## 📋 Available Scripts

### 🟢 **start.sh** (macOS/Linux) | **start.bat** (Windows)
**Complete automated setup and launch**

```bash
./start.sh    # macOS/Linux
start.bat     # Windows
```

**What it does:**
- ✅ Checks Node.js installation
- ✅ Checks/Installs MongoDB (macOS via Homebrew)
- ✅ Creates `.env` file if missing
- ✅ Installs npm dependencies
- ✅ Starts MongoDB service
- ✅ Optionally seeds database with sample data
- ✅ Starts the application server

**First-time users: Use this script!**

---

### ⚡ **setup.sh** (macOS/Linux only)
**Quick setup without starting server**

```bash
./setup.sh
```

Sets up the environment (MongoDB, dependencies, .env) but doesn't start the server.
Use this if you want to configure things before starting.

---

### 🔴 **stop.sh** (macOS/Linux only)
**Graceful shutdown**

```bash
./stop.sh
```

Stops the Node.js server and optionally stops MongoDB.

---

## 🎯 Typical First-Time Usage

```bash
# 1. Make scripts executable (macOS/Linux)
chmod +x start.sh setup.sh stop.sh

# 2. Run the startup script
./start.sh

# 3. When prompted, choose 'y' to seed sample data
# The server will start automatically

# 4. Open in browser:
#    - Registration: frontend/index.html
#    - Dashboard: frontend/dashboard.html
#    - Admin Panel: frontend/admin.html

# 5. When done, stop the server
# Press Ctrl+C or run: ./stop.sh
```

---

## 📦 Alternative: npm Commands

If scripts don't work, use npm commands:

```bash
# Setup only
npm install

# Start MongoDB manually
brew services start mongodb-community  # macOS
sudo systemctl start mongodb           # Linux
net start MongoDB                      # Windows

# Seed database
npm run seed

# Start server
npm start              # Production mode
npm run dev            # Development mode (auto-restart)
```

---

## 🔧 Manual Setup (If Scripts Fail)

1. **Install MongoDB**
   - macOS: `brew install mongodb-community`
   - Linux: `sudo apt-get install mongodb`
   - Windows: Download from mongodb.com

2. **Create .env file**
   ```bash
   cp .env.example .env
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start MongoDB**
   ```bash
   brew services start mongodb-community  # macOS
   sudo systemctl start mongodb           # Linux
   net start MongoDB                      # Windows
   ```

5. **Seed database (optional)**
   ```bash
   npm run seed
   ```

6. **Start server**
   ```bash
   npm start
   ```

---

## 📚 Documentation

- **STARTUP_GUIDE.md** - Complete startup documentation
- **QUICK_REFERENCE.txt** - One-page command reference
- **README.md** - Full project documentation
- **QUICKSTART.md** - Quick setup guide

---

## ⚠️ Troubleshooting

### "Permission denied" (macOS/Linux)
```bash
chmod +x start.sh setup.sh stop.sh
```

### "Port 3000 already in use"
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9        # macOS/Linux
netstat -ano | findstr :3000         # Windows (find PID)
taskkill /PID <PID> /F               # Windows (kill process)
```

### "MongoDB connection failed"
```bash
# Check if MongoDB is running
pgrep mongod                         # macOS/Linux
sc query MongoDB                     # Windows

# Start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongodb           # Linux
net start MongoDB                      # Windows
```

### "npm install fails"
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 🌐 Access URLs (After Starting)

| Service | URL |
|---------|-----|
| **API Server** | http://localhost:3000/api |
| **Health Check** | http://localhost:3000/api/health |
| **Registration** | Open `frontend/index.html` |
| **Dashboard** | Open `frontend/dashboard.html` |
| **Admin Panel** | Open `frontend/admin.html` |

---

## 💡 Tips

1. **First time setup**: Always run `./start.sh` and seed the database
2. **Development**: Use `npm run dev` for auto-restart on changes
3. **Production**: Use `npm start` or PM2 for process management
4. **Reset database**: Run `npm run seed` again (clears and reseeds)
5. **View logs**: Terminal output shows all activity

---

## 📊 Sample Data (from seed script)

After seeding, you'll have:
- **3 Contests** (2 Active, 1 Draft)
- **150 Participants** across all contests
- Various stages (Registered, Qualified, Finalist)
- Engagement scores and fraud scores
- Realistic names and email addresses

---

## 🎓 For Exam/Demo

1. Run `./start.sh` and seed the database
2. Show the three frontend pages
3. Demonstrate registration (duplicate detection)
4. Show dashboard with live metrics
5. Use admin panel to select winners
6. Explain fairness algorithms (see BUSINESS_REPORT.md)

---

**Need more help?** See STARTUP_GUIDE.md or QUICK_REFERENCE.txt

---

Made with ❤️ for easy setup and deployment
