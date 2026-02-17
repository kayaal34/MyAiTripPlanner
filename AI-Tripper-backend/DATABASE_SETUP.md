# Database Setup Guide

## PostgreSQL Installation

### Windows:
1. Download PostgreSQL: https://www.postgresql.org/download/windows/
2. Install and remember the password you set for the `postgres` user
3. Create database:
```bash
psql -U postgres
CREATE DATABASE aitripper;
\q
```

### macOS (using Homebrew):
```bash
brew install postgresql
brew services start postgresql
createdb aitripper
```

### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb aitripper
```

## Redis Installation

### Windows:
1. Use Redis on WSL or Docker:
```bash
docker run -d -p 6379:6379 redis
```

### macOS (using Homebrew):
```bash
brew install redis
brew services start redis
```

### Linux (Ubuntu/Debian):
```bash
sudo apt install redis-server
sudo systemctl start redis-server
```

## Python Dependencies Installation

```bash
# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt
```

## Environment Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your credentials:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/aitripper
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=generate-with-openssl-rand-hex-32
GOOGLE_API_KEY=your-gemini-api-key
```

## Run Migrations (Optional - tables auto-create on startup)

```bash
# If using Alembic later
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## Start Server

```bash
uvicorn main:app --reload
```

Server will be available at: http://localhost:8000
API docs: http://localhost:8000/docs

## API Endpoints

### Authentication:
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login (returns JWT token)
- GET `/api/auth/me` - Get current user info

### Routes:
- POST `/api/routes/saved` - Save a route
- GET `/api/routes/saved` - Get all saved routes
- GET `/api/routes/saved/{id}` - Get specific route
- PUT `/api/routes/saved/{id}` - Update route
- DELETE `/api/routes/saved/{id}` - Delete route

### Favorites:
- POST `/api/favorites` - Add favorite place
- GET `/api/favorites` - Get all favorites
- DELETE `/api/favorites/{id}` - Remove favorite

### History:
- POST `/api/history` - Add to history (auto-added on route generation)
- GET `/api/history` - Get route history

### Route Generation:
- POST `/api/route` - Generate new route (requires auth, auto-saves to history)
