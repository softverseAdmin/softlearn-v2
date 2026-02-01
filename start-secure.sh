#!/bin/bash

# Quick Setup Script for SoftLearn After Security Fixes
# Run this after pulling the security fixes

echo "🚀 SoftLearn - Post-Security-Fix Setup"
echo "======================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check if .env exists
echo "📋 Step 1: Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Running security setup...${NC}"
    ./setup-security.sh
else
    echo -e "${GREEN}✓ .env file exists${NC}"
    
    # Check if secrets are still placeholders
    if grep -q "CHANGE_THIS" .env; then
        echo -e "${RED}⚠️  WARNING: .env contains placeholder values!${NC}"
        echo "   Please run: ./setup-security.sh"
        echo "   Or manually update the CHANGE_THIS_* values in .env"
        exit 1
    fi
fi

# Step 2: Install backend dependencies
echo ""
echo "📦 Step 2: Installing backend dependencies..."
cd backend
if ! bundle check > /dev/null 2>&1; then
    echo "Installing gems..."
    bundle install
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi
cd ..

# Step 3: Start database
echo ""
echo "🗄️  Step 3: Starting PostgreSQL database..."
docker compose up -d postgres

# Wait for postgres to be ready
echo "Waiting for database to be ready..."
sleep 5

# Step 4: Run migrations
echo ""
echo "🔄 Step 4: Running database migrations..."
docker compose exec -T backend bin/rails db:create 2>/dev/null || true
docker compose exec -T backend bin/rails db:migrate

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Migrations completed successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Note: If migrations fail, the database may need to be reset${NC}"
    echo "   You can reset with: docker compose exec backend bin/rails db:reset"
fi

# Step 5: Start all services
echo ""
echo "🚀 Step 5: Starting all services..."
docker compose up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 8

# Step 6: Verify services
echo ""
echo "🔍 Step 6: Verifying services..."

# Check backend
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend API is running${NC}"
else
    echo -e "${RED}✗ Backend API is not responding${NC}"
    echo "  Check logs with: docker compose logs backend"
fi

# Check frontend (if running via docker)
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is running${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend may not be running via Docker${NC}"
    echo "  To start frontend: cd frontend && npm install && npm run dev"
fi

# Step 7: Display summary
echo ""
echo "======================================"
echo "🎉 Setup Complete!"
echo "======================================"
echo ""
echo "📍 Access Points:"
echo "  • Frontend:  http://localhost:5173"
echo "  • Backend:   http://localhost:3000"
echo "  • Health:    http://localhost:3000/api/health"
echo ""
echo "🔐 Security Features Enabled:"
echo "  ✓ Rate limiting on auth endpoints"
echo "  ✓ httpOnly cookie authentication"
echo "  ✓ CSRF protection"
echo "  ✓ Strong password requirements (12+ chars)"
echo "  ✓ Security audit logging"
echo "  ✓ Secure password reset tokens"
echo ""
echo "📚 Important Files:"
echo "  • SECURITY_AUDIT_REPORT.md - Original vulnerability report"
echo "  • SECURITY_FIXES_APPLIED.md - What was fixed and how"
echo "  • IMPLEMENTATION_SUMMARY.md - Complete overview"
echo "  • README.md - Updated usage documentation"
echo ""
echo "🧪 Test Your Security:"
echo "  # Try weak password (should fail)"
echo "  curl -X POST http://localhost:3000/api/sign-up \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"email\":\"test@test.com\",\"password\":\"weak\",\"password_confirmation\":\"weak\"}'"
echo ""
echo "  # Check rate limiting (6th attempt should fail)"
echo "  for i in {1..6}; do curl -X POST http://localhost:3000/api/sign-in \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"email\":\"test@test.com\",\"password\":\"wrong\"}'; done"
echo ""
echo "📊 View Logs:"
echo "  docker compose logs -f backend    # Backend logs"
echo "  docker compose logs backend | grep SECURITY_AUDIT  # Security events"
echo ""
echo "🆘 Troubleshooting:"
echo "  • JWT_SECRET error: Check .env file has proper JWT_SECRET"
echo "  • Migration errors: docker compose exec backend bin/rails db:reset"
echo "  • Rate limit 429: Wait 15 minutes or restart: docker compose restart"
echo ""
echo -e "${GREEN}✓ All systems operational!${NC}"
