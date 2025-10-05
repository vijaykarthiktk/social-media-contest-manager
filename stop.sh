#!/bin/bash

# Social Media Contest Manager - Stop Script
# This script stops the Node.js server and optionally MongoDB

echo "🛑 Social Media Contest Manager - Stop Script"
echo "=============================================="
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Stop Node.js processes running server.js
print_info "Stopping Node.js server..."
pkill -f "node.*server.js" 2>/dev/null
if [ $? -eq 0 ]; then
    print_success "Node.js server stopped"
else
    print_info "No Node.js server was running"
fi

# Ask if user wants to stop MongoDB
echo ""
read -p "Do you want to stop MongoDB as well? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Stopping MongoDB..."
    
    if command -v brew &> /dev/null; then
        brew services stop mongodb-community
        print_success "MongoDB stopped"
    else
        pkill -f mongod
        print_success "MongoDB stopped"
    fi
else
    print_info "MongoDB is still running"
fi

echo ""
print_success "Cleanup complete!"
