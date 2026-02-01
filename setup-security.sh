#!/bin/bash

# SoftLearn Security Setup Script
# This script helps you set up secure configuration for the application

set -e

echo "🔒 SoftLearn Security Setup"
echo "=============================="
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo "⚠️  Warning: .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 1
    fi
fi

# Copy .env.example to .env
echo "📝 Creating .env file from template..."
cp .env.example .env

# Generate secure JWT secret
echo "🔑 Generating secure JWT secret..."
if command -v ruby &> /dev/null; then
    JWT_SECRET=$(ruby -rsecurerandom -e 'puts SecureRandom.hex(32)')
elif command -v openssl &> /dev/null; then
    JWT_SECRET=$(openssl rand -hex 32)
else
    echo "⚠️  Warning: Neither ruby nor openssl found. Please manually set JWT_SECRET in .env"
    JWT_SECRET="PLEASE_CHANGE_THIS_TO_SECURE_RANDOM_STRING"
fi

# Generate secure database password
echo "🔑 Generating secure database password..."
if command -v openssl &> /dev/null; then
    DB_PASSWORD=$(openssl rand -base64 24)
else
    echo "⚠️  Warning: openssl not found. Please manually set POSTGRES_PASSWORD in .env"
    DB_PASSWORD="PLEASE_CHANGE_THIS_PASSWORD"
fi

# Update .env file
echo "✏️  Updating .env with generated secrets..."
sed -i.bak "s|CHANGE_THIS_TO_SECURE_RANDOM_STRING_MIN_32_CHARS|$JWT_SECRET|g" .env
sed -i.bak "s|CHANGE_THIS_SECURE_PASSWORD_NOW|$DB_PASSWORD|g" .env

# Clean up backup file
rm -f .env.bak

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Generated Configuration:"
echo "  - JWT_SECRET: ${JWT_SECRET:0:20}... (${#JWT_SECRET} characters)"
echo "  - POSTGRES_PASSWORD: ${DB_PASSWORD:0:8}... (${#DB_PASSWORD} characters)"
echo ""
echo "⚠️  IMPORTANT SECURITY NOTES:"
echo "  1. Never commit the .env file to version control"
echo "  2. Use different secrets for each environment (dev/staging/prod)"
echo "  3. Store production secrets in a secure vault"
echo "  4. Rotate secrets periodically"
echo ""
echo "📚 Next Steps:"
echo "  1. Review and customize .env file"
echo "  2. Run: docker compose up --build"
echo "  3. Run migrations: docker compose exec backend bin/rails db:migrate"
echo "  4. Check security audit report: SECURITY_AUDIT_REPORT.md"
echo ""
echo "🔐 Your .env file has been created and secured!"
