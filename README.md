# SoftLearn

Full-stack learning management application with enhanced security.

- **Backend**: Ruby on Rails (API-only), PostgreSQL
- **Frontend**: Vite + React

## 🔒 Security Features

✅ Rate limiting on authentication endpoints  
✅ Secure token-based password reset  
✅ httpOnly cookie authentication  
✅ CSRF protection  
✅ Strong password requirements (12+ chars, mixed case, numbers)  
✅ Security event logging  
✅ Protected against XSS, CSRF, SQL injection  
✅ Environment-based configuration (no hardcoded secrets)

## Quick Start (Docker)

### 1. Security Setup (Required First Time)

```bash
# Run automated security setup
./setup-security.sh

# Or manually:
cp .env.example .env
# Edit .env and set secure values for:
# - JWT_SECRET (32+ characters)
# - POSTGRES_PASSWORD
```

### 2. Start Application

```bash
# Build and start all services
docker compose up --build

# Run database migrations
docker compose exec backend bin/rails db:migrate
```

### 3. Access Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api/health

## Local Development (without Docker)

### Backend

```bash
cd backend

# Install dependencies
bundle install

# Set environment variables
export DATABASE_URL=postgresql://postgres:your-password@localhost:5432/SoftLearn_development
export JWT_SECRET=$(openssl rand -hex 32)  # Generate secure secret
export ALLOWED_ORIGINS=http://localhost:5173

# Setup database
bin/rails db:prepare
bin/rails db:migrate

# Start server
bin/rails s -p 3000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local with:
echo "VITE_API_BASE_URL=http://localhost:3000" > .env.local

# Start development server
npm run dev
```

## 📋 Security Requirements

### Required Environment Variables

**Critical (must set):**
- `JWT_SECRET` - Minimum 32 characters, randomly generated
- `POSTGRES_PASSWORD` - Strong database password

**Recommended:**
- `ALLOWED_ORIGINS` - Comma-separated list of allowed frontend URLs
- `RAILS_ENV` - Set to `production` for production deployments

### Password Requirements

Users must create passwords with:
- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit

### Rate Limits

- Login attempts: 5 per IP per 15 minutes
- Registration: 3 per IP per hour
- Password reset: 3 per email per hour
- API requests: 300 per IP per 5 minutes

## 🧪 Testing

```bash
# Backend tests
cd backend
bundle exec rspec

# Check security configuration
bin/rails runner "puts User.jwt_secret.length"  # Should be 32+
```

## 📚 Documentation

- **[SECURITY_AUDIT_REPORT.md](SECURITY_AUDIT_REPORT.md)** - Comprehensive security analysis
- **[SECURITY_FIXES_APPLIED.md](SECURITY_FIXES_APPLIED.md)** - Detailed fixes and setup guide
- **[FRONTEND_API_FIXES.md](FRONTEND_API_FIXES.md)** - API client improvements
- **[TEST_RESULTS.md](TEST_RESULTS.md)** - Testing documentation

## 🔐 Security Best Practices

1. **Never commit secrets** - Use `.env` files (already in `.gitignore`)
2. **Rotate secrets regularly** - Generate new JWT_SECRET periodically
3. **Use HTTPS in production** - Enable `force_ssl` in production
4. **Monitor logs** - Check security audit logs regularly
5. **Update dependencies** - Run `bundle audit` and `npm audit` regularly

## 🆘 Troubleshooting

### "JWT_SECRET must be set" error
```bash
# Generate and set JWT_SECRET
export JWT_SECRET=$(openssl rand -hex 32)
```

### Rate limit errors (429)
Wait for the rate limit period to expire or whitelist your IP in `config/initializers/rack_attack.rb`

### CORS errors
Add your frontend URL to `ALLOWED_ORIGINS` in `.env`

## 🚀 Production Deployment

1. Generate strong secrets:
   ```bash
   ruby -rsecurerandom -e 'puts SecureRandom.hex(64)'
   ```

2. Set environment variables on your hosting platform

3. Enable SSL/TLS:
   ```ruby
   # config/environments/production.rb
   config.force_ssl = true  # Already enabled
   ```

4. Set secure cookies:
   ```env
   RAILS_ENV=production
   SESSION_SECURE=true
   ```

5. Review security headers in `config/initializers/security_headers.rb`

## 📊 Monitoring

Security events are logged in JSON format:
```bash
docker compose logs backend | grep SECURITY_AUDIT
```

Events include:
- Login success/failure with IP
- User registration
- Password reset requests
- Token revocation
- Suspicious activity

## 🤝 Contributing

When contributing:
1. Run security checks: `bundle audit`, `npm audit`
2. Follow password validation rules
3. Never log sensitive data
4. Add tests for security features
5. Update documentation

## 📄 License

This project implements OWASP Top 10 security controls and follows Rails security best practices.
