# 🔐 Authentication System Documentation

Complete login and authentication system with JWT tokens, password hashing, and account security features.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [API Endpoints](#api-endpoints)
6. [Usage Guide](#usage-guide)
7. [Security Features](#security-features)
8. [Testing](#testing)

---

## 🎯 Overview

The authentication system provides secure user registration and login functionality with:
- **Email & Password Authentication**
- **JWT Token-based Authentication**
- **Password Hashing with bcrypt**
- **Account Lockout Protection**
- **Role-Based Access Control**
- **Session Management**

---

## ✨ Features

### User Management
- ✅ User Registration
- ✅ User Login
- ✅ Password Encryption (bcrypt)
- ✅ JWT Token Generation
- ✅ Account Roles (user, moderator, admin)
- ✅ Account Status (active/inactive)

### Security
- ✅ Password Hashing (bcrypt with salt)
- ✅ JWT Token Authentication
- ✅ Account Lockout (5 failed attempts = 1 hour lock)
- ✅ Secure Cookie Support
- ✅ Protected Routes
- ✅ Role-Based Authorization

### User Experience
- ✅ Beautiful Login/Register UI
- ✅ Password Visibility Toggle
- ✅ Real-time Validation
- ✅ Error Handling
- ✅ Auto-Redirect based on Role

---

## 🔧 Backend Implementation

### File Structure

```
backend/
├── models/
│   └── User.js                 # User model with password hashing
├── controllers/
│   └── authController.js       # Auth logic (register, login, etc.)
├── middleware/
│   └── auth.js                 # JWT verification & protection
├── routes/
│   └── authRoutes.js           # Auth API routes
└── server.js                   # Updated with auth routes
```

### User Model (`models/User.js`)

**Schema Fields:**
```javascript
{
  email: String (unique, required, lowercase)
  password: String (hashed, min 6 chars, not returned in queries)
  name: String (required)
  role: String (admin, moderator, user)
  isActive: Boolean (default: true)
  isEmailVerified: Boolean (default: false)
  lastLogin: Date
  loginAttempts: Number
  lockUntil: Date
  resetPasswordToken: String
  resetPasswordExpire: Date
}
```

**Key Features:**
- ✅ Automatic password hashing on save
- ✅ Password comparison method
- ✅ Account lock detection
- ✅ Login attempt tracking
- ✅ Password excluded from JSON responses

**Methods:**
```javascript
user.comparePassword(candidatePassword)  // Returns boolean
user.isLocked()                          // Returns boolean
user.incLoginAttempts()                  // Increments attempts
user.resetLoginAttempts()                // Resets on successful login
```

---

### Auth Controller (`controllers/authController.js`)

**Available Functions:**

#### 1. Register User
```javascript
POST /api/auth/register
Body: { name, email, password, role? }
Response: { success, message, token, user }
```

#### 2. Login User
```javascript
POST /api/auth/login
Body: { email, password }
Response: { success, message, token, user }
```

#### 3. Get Current User
```javascript
GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: { success, user }
```

#### 4. Logout
```javascript
POST /api/auth/logout
Headers: Authorization: Bearer <token>
Response: { success, message }
```

#### 5. Update Password
```javascript
PUT /api/auth/updatepassword
Headers: Authorization: Bearer <token>
Body: { currentPassword, newPassword }
Response: { success, message, token }
```

#### 6. Create Admin
```javascript
POST /api/auth/create-admin
Body: { name, email, password }
Response: { success, message, token, user }
```

---

### Auth Middleware (`middleware/auth.js`)

**Functions:**

#### `protect` - Require Authentication
```javascript
// Protects routes requiring login
router.get('/protected', protect, controller);
```

Checks for JWT token in:
1. Authorization header (Bearer token)
2. Cookies

#### `authorize(...roles)` - Role-Based Access
```javascript
// Restrict to specific roles
router.delete('/admin', protect, authorize('admin'), controller);
```

#### `optionalAuth` - Optional Authentication
```javascript
// Adds user if authenticated, continues if not
router.get('/public', optionalAuth, controller);
```

**Token Functions:**
```javascript
generateToken(userId)     // Creates JWT token
verifyToken(token)        // Verifies and decodes token
```

---

## 🎨 Frontend Implementation

### File Structure

```
frontend/
├── login.html              # Login page
├── register.html           # Registration page
└── js/
    ├── config.js          # Updated with AUTH endpoints
    ├── login.js           # Login logic
    └── register.js        # Registration logic
```

### Login Page (`login.html`)

**Features:**
- Email & password inputs
- Password visibility toggle
- Remember me checkbox
- Forgot password link
- Auto-redirect on existing auth
- Loading state
- Error handling
- Demo credentials display

**Design:**
- Gradient background
- Glassmorphism card
- Smooth animations
- Responsive layout

---

### Register Page (`register.html`)

**Features:**
- Name, email, password fields
- Password confirmation
- Role selection (user, moderator, admin)
- Password strength indicator
- Real-time validation
- Terms & conditions
- Auto-login after registration

---

### JavaScript Logic

#### Login (`js/login.js`)

**Key Functions:**
```javascript
togglePassword()              // Show/hide password
showAlert(message, type)      // Display alerts
validateEmail(email)          // Email format validation
saveAuthToken(token)          // Store JWT token
checkExistingAuth()           // Check if already logged in
```

**Login Flow:**
1. Validate email and password
2. Send POST request to `/api/auth/login`
3. Save token to localStorage
4. Save user data
5. Redirect based on role (admin → admin.html, user → dashboard.html)

#### Register (`js/register.js`)

**Key Functions:**
```javascript
togglePassword(fieldId)       // Show/hide password
validateEmail(email)          // Email validation
showFieldError(field, msg)    // Show field errors
clearAllErrors()              // Clear all errors
```

**Registration Flow:**
1. Validate all fields
2. Check passwords match
3. Send POST request to `/api/auth/register`
4. Auto-save token and user data
5. Redirect to appropriate page

---

## 📡 API Endpoints

### Public Endpoints (No Auth Required)

#### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "user"  // Optional: user, moderator, admin
}

Response 201:
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5ec49f1b2c72b8c8e4f5a",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isActive": true
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}

Response 200:
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5ec49f1b2c72b8c8e4f5a",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "lastLogin": "2025-10-04T10:30:00.000Z"
  }
}
```

#### Create Admin User
```http
POST /api/auth/create-admin
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123"
}

Response 201:
{
  "success": true,
  "message": "Admin user created successfully",
  "token": "...",
  "user": { ... }
}

Note: Should be disabled in production or protected!
```

---

### Protected Endpoints (Require Authentication)

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response 200:
{
  "success": true,
  "user": {
    "id": "60d5ec49f1b2c72b8c8e4f5a",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isActive": true,
    "createdAt": "2025-10-04T10:00:00.000Z"
  }
}
```

#### Logout User
```http
POST /api/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response 200:
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Update Password
```http
PUT /api/auth/updatepassword
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}

Response 200:
{
  "success": true,
  "message": "Password updated successfully",
  "token": "new_jwt_token..."
}
```

---

## 📖 Usage Guide

### Quick Start

#### 1. Start the Server
```bash
npm start
```

#### 2. Create Admin User (First Time)
```bash
# Option A: Using curl
curl -X POST http://localhost:3000/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@example.com",
    "password": "admin123"
  }'

# Option B: Open register.html and select "Administrator" role
```

#### 3. Access Login Page
```
Open: frontend/login.html
```

#### 4. Login
```
Email: admin@example.com
Password: admin123
```

#### 5. You'll be redirected to admin.html (or dashboard.html for regular users)

---

### Protecting Routes

#### Require Authentication
```javascript
const { protect } = require('./middleware/auth');

router.get('/protected-route', protect, (req, res) => {
    // req.user is available here
    res.json({ user: req.user });
});
```

#### Require Specific Role
```javascript
const { protect, authorize } = require('./middleware/auth');

router.delete('/admin-only', protect, authorize('admin'), (req, res) => {
    res.json({ message: 'Admin access granted' });
});

router.post('/staff', protect, authorize('admin', 'moderator'), (req, res) => {
    res.json({ message: 'Staff access granted' });
});
```

#### Optional Authentication
```javascript
const { optionalAuth } = require('./middleware/auth');

router.get('/public', optionalAuth, (req, res) => {
    if (req.user) {
        res.json({ message: `Hello ${req.user.name}` });
    } else {
        res.json({ message: 'Hello guest' });
    }
});
```

---

### Frontend Authentication

#### Making Authenticated Requests
```javascript
const token = localStorage.getItem('authToken');

fetch('http://localhost:3000/api/auth/me', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
})
.then(res => res.json())
.then(data => console.log(data));
```

#### Check if User is Logged In
```javascript
function isAuthenticated() {
    const token = localStorage.getItem('authToken');
    return token !== null;
}

function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function getUserRole() {
    const user = getUser();
    return user ? user.role : null;
}
```

#### Logout
```javascript
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}
```

---

## 🔒 Security Features

### Password Security
- ✅ **bcrypt Hashing**: Industry-standard password hashing
- ✅ **Salt Rounds**: 10 rounds (automatically handled)
- ✅ **Minimum Length**: 6 characters enforced
- ✅ **No Plain Text**: Passwords never stored in plain text

### JWT Security
- ✅ **Token Expiration**: 7 days validity
- ✅ **Secure Secret**: Stored in environment variables
- ✅ **HttpOnly Cookies**: Optional cookie storage (CSRF protection)
- ✅ **Bearer Token**: Standard Authorization header support

### Account Protection
- ✅ **Rate Limiting**: 100 requests per 15 minutes
- ✅ **Account Lockout**: 5 failed attempts = 1 hour lock
- ✅ **Attempt Tracking**: Login attempts logged
- ✅ **Active Status**: Deactivated accounts blocked

### Best Practices Implemented
- ✅ Password not included in query results by default
- ✅ Sensitive data excluded from JSON responses
- ✅ Timing-safe password comparison
- ✅ CORS enabled for frontend access
- ✅ Helmet.js for security headers

---

## 🧪 Testing

### Test User Registration

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "user"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Protected Route
```bash
# Replace TOKEN with actual token from login response
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

### Test Invalid Login (Trigger Lockout)
```bash
# Run this 5 times with wrong password
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "wrongpassword"
    }'
done

# 6th attempt should return 423 (Locked)
```

---

## 🎯 Common Scenarios

### Scenario 1: New User Signs Up

1. User fills registration form
2. POST to `/api/auth/register`
3. Server creates user with hashed password
4. Returns JWT token
5. Token saved to localStorage
6. User redirected to dashboard

### Scenario 2: Existing User Logs In

1. User enters email and password
2. POST to `/api/auth/login`
3. Server verifies credentials
4. Checks account status and locks
5. Returns JWT token if valid
6. Token saved, user redirected

### Scenario 3: Accessing Protected Route

1. Frontend reads token from localStorage
2. Includes in Authorization header
3. Backend middleware verifies token
4. Attaches user to request
5. Route handler processes with user context

### Scenario 4: Account Lockout

1. User fails login 5 times
2. Account locked for 1 hour
3. Subsequent login attempts return 423
4. After 1 hour, lockout automatically expires
5. User can try again

---

## 🚀 Production Deployment

### Environment Variables

Create `.env` file:
```bash
# JWT Secret (CHANGE THIS!)
JWT_SECRET=your_super_secure_random_secret_key_here_at_least_32_chars

# Node Environment
NODE_ENV=production

# MongoDB
MONGODB_URI=your_production_mongodb_uri
```

Generate secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Security Checklist

- [ ] Change JWT_SECRET to strong random value
- [ ] Disable or protect `/api/auth/create-admin` route
- [ ] Enable HTTPS (required for secure cookies)
- [ ] Set secure cookie options in production
- [ ] Implement rate limiting (already included)
- [ ] Add email verification (optional enhancement)
- [ ] Implement password reset (optional enhancement)
- [ ] Enable CORS only for trusted origins
- [ ] Add input sanitization (already using express validators)
- [ ] Monitor failed login attempts
- [ ] Implement 2FA (optional enhancement)

---

## 📚 Additional Resources

### Dependencies Added
```json
{
  "jsonwebtoken": "^9.0.2",
  "cookie-parser": "^1.4.6",
  "bcryptjs": "^2.4.3" // Already included
}
```

### Related Files
- `backend/models/User.js` - User model
- `backend/controllers/authController.js` - Auth logic
- `backend/middleware/auth.js` - JWT middleware
- `backend/routes/authRoutes.js` - Auth routes
- `frontend/login.html` - Login UI
- `frontend/register.html` - Register UI
- `frontend/js/login.js` - Login logic
- `frontend/js/register.js` - Register logic

---

## 🎉 Features Summary

✅ **Implemented:**
- Email/password authentication
- User registration
- User login
- Password hashing (bcrypt)
- JWT token generation
- Protected routes middleware
- Role-based access control
- Account lockout protection
- Beautiful login/register UI
- Auto-redirect based on role
- Session management
- Password update
- Logout functionality

🔮 **Future Enhancements:**
- Email verification
- Password reset via email
- Two-factor authentication (2FA)
- OAuth integration (Google, GitHub, etc.)
- Session history/management
- Admin user management panel
- Password strength meter
- Rate limiting per user

---

**Your authentication system is now fully functional! 🎯**

Access the login page at: `frontend/login.html`
Access the register page at: `frontend/register.html`

Start the server: `npm start`
Create admin: POST to `/api/auth/create-admin`

Happy authenticating! 🔐
