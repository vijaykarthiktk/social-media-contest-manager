@echo off
REM Social Media Contest Manager - Startup Script for Windows
REM This script sets up MongoDB and runs the project

echo ========================================
echo Social Media Contest Manager - Startup Script
echo ========================================
echo.

REM Step 1: Check if Node.js is installed
echo [INFO] Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)
node -v
echo [SUCCESS] Node.js is installed
echo.

REM Step 2: Check if MongoDB is installed
echo [INFO] Checking MongoDB installation...
where mongod >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] MongoDB is not installed!
    echo.
    echo Please install MongoDB Community Edition from:
    echo https://www.mongodb.com/try/download/community
    echo.
    echo After installation, add MongoDB to your system PATH and run this script again.
    pause
    exit /b 1
)
echo [SUCCESS] MongoDB is installed
echo.

REM Step 3: Check if .env file exists
echo [INFO] Checking environment configuration...
if not exist .env (
    echo [WARNING] .env file not found. Creating from template...
    
    if exist .env.example (
        copy .env.example .env
        echo [SUCCESS] .env file created
    ) else (
        REM Create a basic .env file
        (
            echo # Server Configuration
            echo PORT=3000
            echo NODE_ENV=development
            echo.
            echo # MongoDB Configuration
            echo MONGODB_URI=mongodb://localhost:27017/contest_manager
            echo.
            echo # JWT Secret ^(change this to a random string^)
            echo JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
            echo.
            echo # Contest Configuration
            echo MAX_PARTICIPANTS_PER_CONTEST=10000
            echo DEFAULT_NUMBER_OF_WINNERS=3
            echo.
            echo # Firebase Configuration ^(Optional - leave empty if not using^)
            echo FIREBASE_PROJECT_ID=
            echo FIREBASE_PRIVATE_KEY=
            echo FIREBASE_CLIENT_EMAIL=
            echo FIREBASE_DATABASE_URL=
        ) > .env
        echo [SUCCESS] .env file created with default values
    )
) else (
    echo [SUCCESS] .env file exists
)
echo.

REM Step 4: Install npm dependencies
echo [INFO] Checking npm dependencies...
if not exist node_modules (
    echo [INFO] Installing npm packages...
    call npm install
    if %ERRORLEVEL% EQU 0 (
        echo [SUCCESS] Dependencies installed successfully
    ) else (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
) else (
    echo [SUCCESS] Dependencies already installed
)
echo.

REM Step 5: Start MongoDB service
echo [INFO] Starting MongoDB service...
sc query MongoDB | find "RUNNING" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] MongoDB service is already running
) else (
    echo [INFO] Attempting to start MongoDB service...
    net start MongoDB >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo [SUCCESS] MongoDB service started
    ) else (
        echo [WARNING] Could not start MongoDB service automatically
        echo [INFO] Trying to start MongoDB manually...
        
        REM Try to start MongoDB manually in a new window
        if exist "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" (
            start "MongoDB" "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "C:\data\db"
            timeout /t 3 >nul
            echo [INFO] MongoDB started in separate window
        ) else if exist "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" (
            start "MongoDB" "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath "C:\data\db"
            timeout /t 3 >nul
            echo [INFO] MongoDB started in separate window
        ) else (
            echo [ERROR] Could not find MongoDB installation
            echo Please start MongoDB manually and run this script again
            pause
            exit /b 1
        )
    )
)
echo.

REM Step 6: Ask if user wants to seed the database
set /p SEED="Do you want to seed the database with sample data? (y/n): "
if /i "%SEED%"=="y" (
    echo [INFO] Seeding database...
    call npm run seed
    if %ERRORLEVEL% EQU 0 (
        echo [SUCCESS] Database seeded successfully
    ) else (
        echo [WARNING] Database seeding failed, but continuing...
    )
) else (
    echo [INFO] Skipping database seeding
)
echo.

REM Step 7: Start the application
echo ========================================
echo [SUCCESS] Setup complete! Starting the application...
echo ========================================
echo.
echo [INFO] Server will start on: http://localhost:3000
echo [INFO] Frontend pages:
echo   - Registration: http://localhost:3000/ or open frontend/index.html
echo   - Dashboard: frontend/dashboard.html
echo   - Admin Panel: frontend/admin.html
echo.
echo [INFO] Press Ctrl+C to stop the server
echo.

REM Start the Node.js server
call npm start
