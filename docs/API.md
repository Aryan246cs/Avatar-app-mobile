# API Documentation

## Base URL

Development: `http://localhost:5000/api`

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Register User

```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing email or password
- `400 Bad Request` - User already exists

---

#### Login User

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing email or password
- `401 Unauthorized` - Invalid credentials

---

## Data Models

### User

```typescript
{
  _id: ObjectId,
  email: string,
  password: string,  // Hashed with bcrypt
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

All errors follow this format:

```json
{
  "message": "Error description"
}
```

### HTTP Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication failed
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Security

### Password Requirements

- Minimum 6 characters
- Hashed using bcrypt (cost factor: 12)

### JWT Token

- Expires in 7 days
- Contains user ID
- Signed with HS256 algorithm

### Best Practices

1. Always use HTTPS in production
2. Store JWT tokens securely (AsyncStorage on mobile)
3. Implement token refresh mechanism
4. Add rate limiting for auth endpoints
5. Validate and sanitize all inputs

## Rate Limiting

Currently not implemented. Recommended limits:

- Login: 5 requests per 15 minutes per IP
- Register: 3 requests per hour per IP

## CORS

Configured to allow requests from:
- `http://localhost:8081` (Expo dev)
- All origins in development

## Future Endpoints

### Avatar Management

```http
POST /avatar/save
GET /avatar/:userId
PUT /avatar/:userId
DELETE /avatar/:userId
```

### User Profile

```http
GET /user/profile
PUT /user/profile
DELETE /user/account
```

### Avatar Sharing

```http
POST /avatar/share
GET /avatar/shared/:shareId
```
