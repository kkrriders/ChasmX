# ChasmX - AI-Powered Workflow Automation

Full-stack application with FastAPI backend and Next.js frontend.

## Architecture

- **Backend**: FastAPI + MongoDB + JWT Auth + OTP
- **Frontend**: Next.js + TypeScript + Tailwind CSS
- **Database**: MongoDB
- **Authentication**: JWT + OTP via email

## Setup Instructions

### Backend Setup

1. **Navigate to backend:**
   ```bash
   cd backend
   ```

2. **Create environment file:**
   ```bash
   cp .env.template .env
   # Edit .env with your actual values
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the server:**
   ```bash
   python run.py
   ```
   → Backend runs on http://localhost:8080

### Frontend Setup

1. **Navigate to frontend:**
   ```bash
   cd Client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   → Frontend runs on http://localhost:3000

## Environment Configuration

### Backend (.env)
Copy `backend/.env.template` to `backend/.env` and configure:

```env
# Required: Generate secure 32+ character secrets
JWT_SECRET_KEY=your-secure-jwt-secret-here
OTP_SECRET_KEY=your-secure-otp-secret-here

# Database
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=chasm_db

# CORS (for frontend connection)
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# SMTP (for OTP emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_SSL=true
```

## API Endpoints

- `POST /auth/register` - User registration
- `POST /auth/login` - User login (sends OTP)
- `POST /auth/verify-otp` - Verify OTP and get token
- `GET /users/me` - Get current user info

## Development

- **Backend**: Hot reload enabled, runs on port 8080
- **Frontend**: Hot reload enabled, runs on port 3000
- **Database**: Requires MongoDB running on localhost:27017
- **CORS**: Pre-configured for local development

## Testing

### Backend
```bash
cd backend
python -m pytest
```

### Frontend
```bash
cd Client
npm run lint
npm run build
```

## Security Features

- JWT authentication with secure token generation
- OTP verification via email
- Account lockout after failed attempts
- CORS protection
- Password hashing with bcrypt
- Environment-based configuration