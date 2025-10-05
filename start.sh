#!/bin/bash

# Social Media Contest Manager - Startup Script
# This script sets up MongoDB and runs the project

echo "🚀 Social Media Contest Manager - Startup Script"
echo "================================================"
echo ""

# Color codes for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Step 1: Check if Node.js is installed
print_info "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed!"
    echo "Please install Node.js from: https://nodejs.org/"
    exit 1
fi
print_success "Node.js $(node -v) is installed"

# Step 2: Check if MongoDB is installed
print_info "Checking MongoDB installation..."
if ! command -v mongod &> /dev/null; then
    print_warning "MongoDB is not installed!"
    echo ""
    print_info "Installing MongoDB via Homebrew..."
    
    # Check if Homebrew is installed
    if ! command -v brew &> /dev/null; then
        print_error "Homebrew is not installed!"
        echo "Please install Homebrew first: https://brew.sh/"
        echo "Then run this script again."
        exit 1
    fi
    
    # Install MongoDB
    brew tap mongodb/brew
    brew install mongodb-community
    print_success "MongoDB installed successfully"
else
    print_success "MongoDB is already installed"
fi

# Step 3: Check if .env file exists
print_info "Checking environment configuration..."
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from template..."
    
    if [ -f .env.example ]; then
        cp .env.example .env
        print_success ".env file created"
        print_warning "Please update .env file with your configuration"
    else
        # Create a basic .env file
        cat > .env << 'EOF'
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/contest_manager

# JWT Secret (change this to a random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Contest Configuration
MAX_PARTICIPANTS_PER_CONTEST=10000
DEFAULT_NUMBER_OF_WINNERS=3

# Firebase Configuration (Optional - leave empty if not using)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
FIREBASE_DATABASE_URL=
EOF
        print_success ".env file created with default values"
    fi
else
    print_success ".env file exists"
fi

# Step 4: Install npm dependencies
print_info "Checking npm dependencies..."
if [ ! -d "node_modules" ]; then
    print_info "Installing npm packages..."
    npm install
    if [ $? -eq 0 ]; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
else
    print_success "Dependencies already installed"
fi

# Step 5: Start MongoDB service
print_info "Starting MongoDB service..."

# Check if MongoDB is already running
if pgrep -x "mongod" > /dev/null; then
    print_success "MongoDB is already running"
else
    # Try to start MongoDB using brew services
    if command -v brew &> /dev/null; then
        brew services start mongodb-community
        sleep 3  # Wait for MongoDB to start
        
        if pgrep -x "mongod" > /dev/null; then
            print_success "MongoDB started successfully"
        else
            print_warning "MongoDB service may not have started. Trying manual start..."
            mongod --config /usr/local/etc/mongod.conf --fork
            sleep 2
            
            if pgrep -x "mongod" > /dev/null; then
                print_success "MongoDB started manually"
            else
                print_error "Failed to start MongoDB"
                print_info "Try starting MongoDB manually with: brew services start mongodb-community"
                exit 1
            fi
        fi
    else
        print_warning "Homebrew not found. Starting MongoDB manually..."
        mongod --dbpath /usr/local/var/mongodb --logpath /usr/local/var/log/mongodb/mongo.log --fork
        sleep 2
        
        if pgrep -x "mongod" > /dev/null; then
            print_success "MongoDB started manually"
        else
            print_error "Failed to start MongoDB"
            exit 1
        fi
    fi
fi

# Step 6: Check MongoDB connection
print_info "Verifying MongoDB connection..."
timeout 5 mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_success "MongoDB connection verified"
else
    # Try legacy mongo shell
    timeout 5 mongo --eval "db.adminCommand('ping')" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        print_success "MongoDB connection verified"
    else
        print_warning "Could not verify MongoDB connection, but continuing..."
    fi
fi

# Step 7: Ask if user wants to seed the database
echo ""
read -p "Do you want to seed the database with sample data? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Seeding database..."
    npm run seed
    if [ $? -eq 0 ]; then
        print_success "Database seeded successfully"
    else
        print_warning "Database seeding failed, but continuing..."
    fi
else
    print_info "Skipping database seeding"
fi

# Step 8: Start the application
echo ""
echo "================================================"
print_success "Setup complete! Starting the application..."
echo "================================================"
echo ""
print_info "Server will start on: http://localhost:3000"
print_info "Frontend pages:"
echo "  • Registration: http://localhost:3000/ or open frontend/index.html"
echo "  • Dashboard: frontend/dashboard.html"
echo "  • Admin Panel: frontend/admin.html"
echo ""
print_info "Press Ctrl+C to stop the server"
echo ""

# Start the Node.js server
npm start
