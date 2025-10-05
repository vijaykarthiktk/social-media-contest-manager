#!/bin/bash

# Quick Setup - Just MongoDB and Dependencies
# Use this if you just want to prepare the environment without starting the server

echo "⚡ Quick Setup - Contest Manager"
echo "================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check Node.js
print_info "Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not installed. Install from: https://nodejs.org/"
    exit 1
fi
print_success "Node.js $(node -v)"

# Check MongoDB
print_info "Checking MongoDB..."
if ! command -v mongod &> /dev/null; then
    if command -v brew &> /dev/null; then
        print_info "Installing MongoDB..."
        brew tap mongodb/brew
        brew install mongodb-community
    else
        echo "❌ Install Homebrew or MongoDB manually"
        exit 1
    fi
fi
print_success "MongoDB ready"

# Start MongoDB
print_info "Starting MongoDB..."
if ! pgrep -x "mongod" > /dev/null; then
    brew services start mongodb-community
    sleep 2
fi
print_success "MongoDB running"

# Install dependencies
print_info "Installing dependencies..."
npm install
print_success "Dependencies installed"

# Create .env if missing
if [ ! -f .env ]; then
    print_info "Creating .env file..."
    cat > .env << 'EOF'
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/contest_manager
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
MAX_PARTICIPANTS_PER_CONTEST=10000
DEFAULT_NUMBER_OF_WINNERS=3
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
FIREBASE_DATABASE_URL=
EOF
    print_success ".env file created"
fi

echo ""
print_success "Setup complete! Ready to run."
echo ""
echo "To start the server:"
echo "  npm start       (production mode)"
echo "  npm run dev     (development mode with auto-restart)"
echo ""
echo "To seed the database:"
echo "  npm run seed"
echo ""
echo "Or use the full startup script:"
echo "  ./start.sh"
