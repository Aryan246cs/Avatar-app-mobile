# Avatar App Backend

A Node.js + Express backend for the Avatar Creation mobile app with JWT authentication.

## Features

- User registration and login
- Password hashing with bcrypt
- JWT token authentication
- MongoDB database with Mongoose
- Input validation and error handling
- CORS enabled for React Native

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup MongoDB
Make sure MongoDB is running on your system:
- **Windows**: Download and install MongoDB Community Server
- **Mac**: `brew install mongodb-community`
- **Linux**: Follow MongoDB installation guide

### 3. Environment Variables
Update the `.env` file with your settings:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/avatar-app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

### 4. Run the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

## API Endpoints

### POST /api/auth/register
Register a new user
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### POST /api/auth/login
Login existing user
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

## Response Format
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Testing
Test the API using tools like Postman or curl:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```