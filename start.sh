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
