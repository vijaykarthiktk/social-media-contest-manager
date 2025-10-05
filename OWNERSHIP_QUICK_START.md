# Quick Start Guide - Ownership-Based Contest System

## 🚀 Getting Started

### 1. Setup Database
```bash
# Seed the database with sample data
node seed.js
```

This creates:
- Sample user: `user@example.com` / `password123`
- 3 sample contests owned by this user
- 150 sample participants

### 2. Start Server
```bash
npm start
```

### 3. Access Application
- Open `frontend/index.html` in your browser
- Or navigate to `frontend/login.html` to login

## 👤 User Actions

### Register New Account
1. Go to `register.html`
2. Fill in: Name, Email, Password
3. Click "Create Account"
4. Automatically redirected to dashboard

### Login
1. Go to `login.html`
2. Enter email and password
3. Click "Login"
4. Redirected to dashboard

## 🏆 Contest Management

### Create Contest
**Endpoint:** `POST /api/contests`
**Headers:** `Authorization: Bearer <token>`

```javascript
{
  "title": "My Contest",
  "description": "Contest description",
  "startDate": "2025-06-01",
  "endDate": "2025-06-30",
  "maxParticipants": 1000,
  "numberOfWinners": 3,
  "platforms": ["Instagram", "Twitter"],
  "fairnessAlgorithm": "PureRandom"
  // ownerId is automatically assigned
}
```

### View All Contests
**Endpoint:** `GET /api/contests`
**Auth:** Optional

Everyone can view all contests (public listing)

### View Contest Details
**Endpoint:** `GET /api/contests/:id`
**Auth:** Optional

### Update Contest (Owner Only)
**Endpoint:** `PUT /api/contests/:id`
**Headers:** `Authorization: Bearer <token>`

Only the owner can update their contest.

### Delete Contest (Owner Only)
**Endpoint:** `DELETE /api/contests/:id`
**Headers:** `Authorization: Bearer <token>`

Only the owner can delete their contest.

### Select Winners (Owner Only)
**Endpoint:** `POST /api/contests/:id/select-winners`
**Headers:** `Authorization: Bearer <token>`

```javascript
{
  "algorithm": "PureRandom",  // optional
  "count": 3                   // optional
}
```

### View Analytics (Owner Only)
**Endpoint:** `GET /api/contests/:id/analytics`
**Headers:** `Authorization: Bearer <token>`

## 🔐 Access Control

### Public Access
- Register new account
- Login
- View all contests
- View contest details
- Register as participant

### Authenticated Users
- Create contests (become owner automatically)
- Manage own contests (update, delete, select winners)
- View analytics for own contests

### Ownership Verification
The system automatically checks:
1. User is authenticated
2. User's ID matches the contest's `ownerId`
3. If not owner → 403 Forbidden error

## 📝 Important Notes

### No More Roles!
- ❌ No admin users
- ❌ No moderators  
- ❌ No role hierarchy
- ✅ Everyone is equal
- ✅ Ownership-based permissions

### Contest Ownership
- Created contest → You're the owner
- Can't edit others' contests
- Can't delete others' contests
- Can't select winners for others' contests

### Frontend Changes
- No role selection during registration
- No admin panel redirect
- All users go to same dashboard
- No role-based UI elements

## 🐛 Troubleshooting

### "Contest not found" Error
- Check if contest ID is correct
- Contest may have been deleted

### "Not authorized" Error (403)
- You're trying to modify someone else's contest
- Only the owner can perform this action

### "Authentication required" Error (401)
- Your token expired
- Login again to get a new token

## 📚 API Response Examples

### Successful Contest Creation
```json
{
  "success": true,
  "message": "Contest created successfully",
  "data": {
    "_id": "contest_id",
    "title": "My Contest",
    "ownerId": "user_id",
    // ... other contest fields
  }
}
```

### Ownership Error
```json
{
  "success": false,
  "message": "You are not authorized to access this contest. Only the contest owner can perform this action."
}
```

## 🔄 Migration from Old System

If you have existing data:

1. **Update Contests:**
   - Add `ownerId` field to all contests
   - Assign to default user or migrate based on `createdBy`

2. **Update Users:**
   - `role` field will be ignored (safe to leave)
   - Or remove with: `db.users.updateMany({}, {$unset: {role: 1}})`

3. **Update Frontend:**
   - Remove any custom role checks
   - Remove admin panel links
   - Update contest management to use ownership checks

## 💡 Best Practices

1. **Always authenticate** before creating/managing contests
2. **Store tokens securely** in localStorage
3. **Handle 403 errors** gracefully in frontend
4. **Show owner-specific actions** only to contest owners
5. **Clear old tokens** on logout

## 🎯 Testing Ownership

```bash
# 1. Register two users
POST /api/auth/register (user1)
POST /api/auth/register (user2)

# 2. User1 creates contest
POST /api/contests (with user1 token)

# 3. User2 tries to update it (should fail)
PUT /api/contests/:id (with user2 token)
# → 403 Forbidden

# 4. User1 updates it (should succeed)
PUT /api/contests/:id (with user1 token)
# → 200 OK
```

## 📞 Support

For issues or questions about the ownership system, refer to:
- `OWNERSHIP_SYSTEM_CHANGES.md` for detailed changes
- API documentation in the codebase
- Middleware code in `backend/middleware/auth.js`
