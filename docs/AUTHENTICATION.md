# Enhanced Authentication System

## Overview

MindScribe now supports multiple authentication methods:

- **Email & Password**: Local registration and login with password validation
- **Google OAuth**: Sign in with Google account
- **GitHub OAuth**: Sign in with GitHub account

## Features

### Email & Password Authentication

- ✅ Password strength validation (8+ chars, uppercase, lowercase, numbers)
- ✅ Secure bcrypt hashing
- ✅ Unique username and email validation
- ✅ Clear error messages

### OAuth Integration

- ✅ Automatic account creation on first login
- ✅ Email-based account linking
- ✅ Profile picture support
- ✅ Social login UI with branded buttons

## User Account Structure

The User model now supports:

```typescript
interface IUser {
  _id: ObjectId;
  username?: string; // Optional for OAuth
  email: string; // Required, unique
  password?: string; // Optional for OAuth
  profile_picture?: string; // From OAuth provider
  provider: "local" | "google" | "github";
  provider_id?: string; // OAuth provider ID
  created_at: Date;
  updated_at: Date;
}
```

## API Endpoints

### Login/Register

#### POST /auth/register

Register with email and password

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

Response:

```json
{
  "message": "User registered successfully"
}
```

#### POST /auth/login

Login with email and password

```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

Response:

```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "provider": "local"
  }
}
```

### OAuth Callbacks

#### POST /auth/google/callback

Exchange Google token for JWT

```json
{
  "token": "google_id_token"
}
```

Response:

```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": "user_id",
    "username": "john.doe@gmail.com",
    "email": "john.doe@gmail.com",
    "provider": "google",
    "profile_picture": "https://..."
  }
}
```

#### POST /auth/github/callback

Exchange GitHub code for JWT

```json
{
  "code": "github_auth_code"
}
```

Response:

```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "provider": "github",
    "profile_picture": "https://avatars.githubusercontent.com/..."
  }
}
```

### Profile Management

#### GET /auth/profile

Get current user profile (requires authentication)

Response:

```json
{
  "id": "user_id",
  "username": "john_doe",
  "email": "john@example.com",
  "provider": "local",
  "profile_picture": null
}
```

## Frontend Components

### Login Component

- Email/password form
- Google OAuth button
- GitHub OAuth button
- Link to signup page
- Theme toggle

### Register Component

- Email/password form with validation
- Password confirmation
- Username field
- Google OAuth button
- GitHub OAuth button
- Link to login page

### GitHub Callback Component

- Handles OAuth redirect
- Shows loading spinner
- Exchanges auth code for token
- Redirects to dashboard on success

## Password Requirements

Passwords must contain:

- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)

Example valid password: `MyPassword123`

## Token Management

Authentication tokens are:

- Stored in localStorage under `authToken`
- JWT tokens valid for 24 hours
- Included in requests via Authorization header: `Bearer {token}`
- Verified server-side on every protected request

## Error Handling

Common authentication errors:

| Error                     | Cause                     | Resolution                   |
| ------------------------- | ------------------------- | ---------------------------- |
| Invalid email or password | Wrong credentials         | Check email and password     |
| Email already registered  | Email exists              | Use different email or login |
| Username already taken    | Username exists           | Use different username       |
| Password too weak         | Doesn't meet requirements | Use stronger password        |
| Invalid or expired token  | Token expired/invalid     | Re-login                     |

## Security Best Practices

1. **HTTPS Only**: Always use HTTPS in production
2. **Secure Cookies**: Enable secure flag for production
3. **CSRF Protection**: Implement CSRF tokens for state changes
4. **Rate Limiting**: Implement rate limiting on auth endpoints
5. **Environment Variables**: Never commit OAuth secrets
6. **Password Hashing**: Uses bcryptjs with 10 salt rounds
7. **Token Validation**: All protected routes verify JWT

## Setup Instructions

### 1. Google OAuth Setup

See [.env.example](.env.example) for Google OAuth credentials setup

### 2. GitHub OAuth Setup

See [.env.example](.env.example) for GitHub OAuth credentials setup

### 3. Backend Environment

```bash
cd apps/api
# Configure .env with all OAuth secrets
bun run dev
```

### 4. Frontend Environment

```bash
cd apps/web
# Configure .env with public OAuth client IDs
bun run dev
```

## Testing

### Test Email/Password Login

1. Register with: `test@example.com` / `TestPass123`
2. Login with same credentials

### Test Google OAuth

1. Click "Google" button
2. Select a Google account
3. Should create/login to account

### Test GitHub OAuth

1. Click "GitHub" button
2. Authorize the app
3. Should create/login to account

## Migration from Old System

The new system is backward compatible with existing local accounts. OAuth users are created as needed on first login.

## Future Enhancements

Potential improvements:

- Email verification
- Password reset functionality
- Two-factor authentication
- Account linking (connect multiple OAuth providers)
- Profile customization
- Social following features
