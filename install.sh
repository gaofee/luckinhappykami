#!/bin/bash

# ===========================================
# LuckinHappy Card Verification System
# Automated Installation Script
# ===========================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration variables
PROJECT_NAME="LuckinHappy Card Verification System"
NODE_MIN_VERSION="18"
REQUIRED_TOOLS=("node" "npm")

# Functions
print_header() {
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}  $PROJECT_NAME${NC}"
    echo -e "${BLUE}  Automated Installation${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo ""
}

print_step() {
    echo -e "${GREEN}[STEP $1/8]${NC} $2"
}

print_warning() {
    echo -e "${YELLOW}WARNING:${NC} $1"
}

print_error() {
    echo -e "${RED}ERROR:${NC} $1"
}

print_success() {
    echo -e "${GREEN}SUCCESS:${NC} $1"
}

check_command() {
    if command -v "$1" >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

get_node_version() {
    if check_command "node"; then
        node -v | sed 's/v//' | cut -d '.' -f 1
    else
        echo "0"
    fi
}

# Main installation process
main() {
    print_header

    echo "This installer will guide you through the setup process."
    echo "Make sure you have administrative privileges if needed."
    echo ""

    # Step 1: Check system requirements
    print_step 1 "Checking system requirements..."

    # Check Node.js
    if ! check_command "node"; then
        print_error "Node.js is not installed. Please install Node.js $NODE_MIN_VERSION+ first."
        print_error "Download from: https://nodejs.org/"
        exit 1
    fi

    NODE_VERSION=$(get_node_version)
    if [ "$NODE_VERSION" -lt "$NODE_MIN_VERSION" ]; then
        print_error "Node.js version $NODE_VERSION is too old. Please upgrade to Node.js $NODE_MIN_VERSION+"
        exit 1
    fi

    print_success "Node.js v$NODE_VERSION found"

    # Check npm
    if ! check_command "npm"; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi

    NPM_VERSION=$(npm -v)
    print_success "npm v$NPM_VERSION found"

    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the project root directory."
        exit 1
    fi

    print_success "Project files verified"

    # Step 2: Install dependencies
    print_step 2 "Installing project dependencies..."

    echo "This may take a few minutes..."
    if ! npm install; then
        print_error "Failed to install dependencies"
        exit 1
    fi

    print_success "Dependencies installed successfully"

    # Step 3: Configure environment
    print_step 3 "Configuring environment variables..."

    if [ ! -f ".env" ]; then
        echo "Creating .env file from template..."
        cp .env.example .env

        # Generate a random JWT secret
        JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || head -c 32 /dev/urandom | xxd -p -c 32)
        if [ -n "$JWT_SECRET" ]; then
            # Replace JWT secret in .env file
            sed -i.bak "s/your-super-secret-jwt-key-change-this-in-production/$JWT_SECRET/" .env && rm .env.bak 2>/dev/null
            print_success "Generated secure JWT secret"
        else
            print_warning "Could not generate random JWT secret. Please set JWT_SECRET manually in .env"
        fi
    else
        print_success "Environment file already exists"
    fi

    # Step 4: Initialize database
    print_step 4 "Initializing database..."

    if ! npm run init-db; then
        print_error "Failed to initialize database"
        exit 1
    fi

    print_success "Database initialized successfully"

    # Step 5: Build the application
    print_step 5 "Building the application..."

    if ! npm run build; then
        print_error "Failed to build application"
        exit 1
    fi

    print_success "Application built successfully"

    # Step 6: Set up PM2 (optional)
    print_step 6 "Setting up PM2 process manager..."

    if check_command "pm2"; then
        echo "PM2 is already installed"

        # Ask user if they want to start with PM2
        echo ""
        echo "Do you want to start the application with PM2? (y/n)"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            if pm2 start ecosystem.config.js 2>/dev/null; then
                pm2 save
                print_success "Application started with PM2"
                PM2_SETUP=true
            else
                print_warning "Failed to start with PM2, you can start manually"
            fi
        fi
    else
        print_warning "PM2 not found. Install PM2 for production use:"
        echo "  npm install -g pm2"
        echo "  pm2 start ecosystem.config.js"
    fi

    # Step 7: Create startup script
    print_step 7 "Creating startup script..."

    cat > start.sh << 'EOF'
#!/bin/bash
# LuckinHappy Card Verification System - Startup Script

echo "Starting LuckinHappy Card Verification System..."

# Check if PM2 is available and configured
if command -v pm2 >/dev/null 2>&1 && [ -f "ecosystem.config.js" ]; then
    echo "Starting with PM2..."
    pm2 start ecosystem.config.js
    pm2 save
    pm2 list
else
    echo "Starting with npm..."
    npm start
fi

echo ""
echo "Application should now be running!"
echo "Access at: http://localhost:3000"
echo ""
echo "To stop the application:"
if command -v pm2 >/dev/null 2>&1; then
    echo "  pm2 stop ecosystem.config.js"
    echo "  pm2 delete ecosystem.config.js"
else
    echo "  Press Ctrl+C if running in foreground"
fi
EOF

    chmod +x start.sh
    print_success "Startup script created (start.sh)"

    # Step 8: Final instructions
    print_step 8 "Installation completed!"

    echo ""
    echo -e "${GREEN}================================================${NC}"
    echo -e "${GREEN}  Installation Complete!${NC}"
    echo -e "${GREEN}================================================${NC}"
    echo ""
    print_success "Project installed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Start the application:"
    echo "   ./start.sh"
    echo ""
    echo "2. Access the application:"
    echo "   http://localhost:3000"
    echo ""
    echo "3. Default admin credentials:"
    echo "   Username: admin"
    echo "   Password: admin123"
    echo ""
    echo "4. For production deployment:"
    echo "   - Set up reverse proxy (nginx)"
    echo "   - Configure SSL certificate"
    echo "   - Change default admin password"
    echo "   - Review security settings"
    echo ""
    print_warning "Remember to change the default admin password!"
    echo ""

    if [ "$PM2_SETUP" = true ]; then
        echo "Application is running with PM2."
        echo "Check status: pm2 list"
        echo "View logs: pm2 logs"
    fi
}

# Check if script is run as root (optional warning)
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root. Consider running as a regular user for security."
fi

# Run main installation
main "$@"
