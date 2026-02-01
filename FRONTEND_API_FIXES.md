# Frontend API Client Fixes

## Changes Made to `frontend/src/api/handleApis.js`

### 1. **Environment-based baseURL** ✅
- **Before:** Hardcoded `"http://localhost:3000"`
- **After:** `import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"`
- **Benefit:** Works across development, staging, and production environments

### 2. **Fixed HTTP Status Code Check** ✅
- **Before:** `error.response.status >= 400 && error.response.status <= 400` (impossible condition!)
- **After:** `error.response?.status >= 400 && error.response?.status <= 499`
- **Benefit:** Correctly catches all 4xx client errors

### 3. **Normalized Error Handling** ✅
- **Before:** Inconsistent error extraction (`error.response.data.message` sometimes)
- **After:** Unified pattern: `error.response.data?.error || error.response.data?.message || 'fallback'`
- **Benefit:** Handles both `{ error: "..." }` and `{ message: "..." }` backend responses

### 4. **Added Response Interceptor for Logging** ✅
- Centralized error logging: logs once in interceptor, eliminates redundant console.logs
- Normalizes error structure for better debugging
- Logs: `API Error [${status}]: ${error}`

### 5. **Removed Unused `getUser()` Endpoint** ✅
- **Issue:** Backend has no route `/user-info`
- **Solution:** Commented out with instructions for enabling if needed
- To enable: Add route `get '/user-info', to: 'users#show'` to `backend/config/routes.rb`

### 6. **Fixed Data Extraction** ✅
- **Before:** `const data = await res.data` (unnecessary await)
- **After:** `const data = res.data`

### 7. **Improved Request Interceptor Error Handling** ✅
- Added console.error for auth header failures instead of silent fail

## Environment Configuration Files Created

### `.env.development`
```
VITE_API_BASE_URL=http://localhost:3000
```

### `.env.staging`
```
VITE_API_BASE_URL=https://staging-api.example.com
```

### `.env.production`
```
VITE_API_BASE_URL=https://api.example.com
```

## Updated Config: `withCredentials`
- Changed from `false` → `true` to support cookie-based sessions with backend
- Adjust back to `false` if using only Bearer token auth

## Usage with Vite

To run with specific environment:
```bash
# Development
npm run dev

# Staging (if configured in package.json)
npm run build -- --mode staging

# Production
npm run build
```

Vite automatically loads `.env.{mode}` files based on the build/dev mode.

## Testing the Changes

1. **Local Development:**
   ```bash
   npm run dev
   # Uses .env.development (http://localhost:3000)
   ```

2. **Test Error Handling:**
   - Sign in with invalid credentials
   - Check browser console for normalized error logs
   - Error messages should come from backend or fallback text

3. **Multi-environment Build:**
   - Update `.env.staging` and `.env.production` with actual URLs
   - Test builds deploy to correct API endpoints

## Notes for Backend Developers

If backend error responses don't follow the pattern:
```json
{ "error": "message" }
// or
{ "message": "message" }
```

Update the error extraction in the response interceptor (lines 27-30).
