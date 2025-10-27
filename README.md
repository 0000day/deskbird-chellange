# Deskbird Challenge - User Management System

Senior Full-Stack Engineer Challenge - User Management Application with Angular frontend, NestJS backend, and real-time Security Insights dashboard.

## 🚀 Live Demo

**Production URL:** [https://dbc.c4dlocal.de](https://dbc.c4dlocal.de)

**Demo Credentials:**
- **Admin User:** 
  - Email: `admin@deskbird.com`
  - Password: `admin#3771!`
- **Test Users:**
  - Email: `john.doe@deskbird.com` / Password: `user123`
  - Email: `jane.smith@deskbird.com` / Password: `user123`
  - Email: `mike.wilson@deskbird.com` / Password: `user123`

## 🏗️ Architecture

- **Frontend:** Angular 19 with PrimeNG, NgRx State Management
- **Backend:** NestJS with Prisma ORM, JWT Authentication
- **Database:** PostgreSQL (Docker)
- **Deployment:** Ubuntu Server with nginx reverse proxy, SSL via Let's Encrypt
- **CICD** Out of scope for this demo

## 📋 Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/0000day/deskbird-chellange.git
cd deskbird-chellange
```

### 2. Start Database
```bash
docker compose up -d
```

### 3. Backend Setup
```bash
cd apps/backend
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed database with demo users
npm run db:seed

# Start backend
npm run start:dev
```
Backend runs at: `http://localhost:3000`

### 4. Frontend Setup
```bash
cd apps/frontend
npm install

# Start frontend
npm run start
```
Frontend runs at: `http://localhost:4200`

## 🗄️ Database Management

### Access PostgreSQL
```bash
# Connect to database
docker exec -it deskbird-postgres psql -U postgres -d deskbird_dev

# View tables
\dt

# View users
SELECT email, "firstName", "lastName", role FROM "User";

# View security data
SELECT * FROM "IpAddress" ORDER BY "attackCount" DESC LIMIT 10;
SELECT * FROM "AttackAttempt" ORDER BY timestamp DESC LIMIT 10;
```

### Reset Database
```bash
cd apps/backend
npx prisma migrate reset
npm run db:seed
```

## 🔧 Development Commands

### Backend Commands
```bash
cd apps/backend

# Development
npm run start:dev

# Production build
npm run build
npm run start:prod

# Database
npx prisma generate
npx prisma migrate dev
npx prisma studio
npm run db:seed
```

### Frontend Commands
```bash
cd apps/frontend

# Development
npm run start

# Production build
npm run build

# Build for production
npm run build -- --configuration production
```

## 🌐 Production Deployment

The application is deployed on Ubuntu 24.04 with:

### Server Setup
1. **Install dependencies:**
```bash
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
apt install -y nodejs nginx docker.io docker-compose-v2
```

2. **Clone and build:**
```bash
cd /var/www
git clone https://github.com/0000day/deskbird-chellange.git
cd deskbird-chellange
docker compose up -d
```

3. **Backend deployment:**
```bash
cd apps/backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run build
```

4. **Frontend deployment:**
```bash
cd apps/frontend
npm install
npm run build -- --configuration production
```

5. **nginx Configuration:**
```nginx
server {
    listen 80;
    server_name dbc.c4dlocal.de;
    
    # Frontend
    location / {
        root /var/www/deskbird-chellange/apps/frontend/dist/frontend/browser;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

6. **SSL Certificate:**
```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d dbc.c4dlocal.de
```

## 📁 Project Structure

```
deskbird-chellange/
├── apps/
│   ├── backend/          # NestJS Backend
│   │   ├── src/          # Source code
│   │   ├── prisma/       # Database schema & migrations
│   │   └── package.json  # Backend dependencies
│   └── frontend/         # Angular Frontend
│       ├── src/          # Source code
│       ├── dist/         # Build output
│       └── package.json  # Frontend dependencies
├── tools/
│   └── security/         # Security monitoring tools
│       ├── parse-auth-logs.sh  # Log parser script
│       └── config.env    # Parser configuration
├── docker-compose.yml    # PostgreSQL container
├── init.sql             # Database initialization
└── README.md            # This file
```

## 🔐 Environment Configuration

### Backend (.env)
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/deskbird_dev?schema=public"
JWT_SECRET="your-secure-jwt-secret"
PORT=3000
```
*Note: Database runs in Docker container, not exposed externally*

### Frontend Environments
- **Development:** `src/environments/environment.ts` → `http://localhost:3000`
- **Production:** `src/environments/environment.prod.ts` → `/api`

## 🎯 Features

### User Management
- ✅ User authentication (JWT)
- ✅ Role-based access control (Admin/User)
- ✅ User CRUD operations
- ✅ Email validation and restrictions
- ✅ Self-deletion prevention

### Security Insights Dashboard
- ✅ Real-time attack monitoring
- ✅ Geographic attack visualization
- ✅ Attack timeline charts
- ✅ Failed login attempt tracking
- ✅ Top attacker statistics

### Technical
- ✅ Responsive design with PrimeNG
- ✅ Global toast notifications
- ✅ Production deployment with SSL
- ✅ Automated log parsing with fail2ban integration

## 🔒 Security Monitoring

The application includes real-time security monitoring via automated log parsing:

```bash
# Setup security log parser (production)
cd tools/security
chmod +x parse-auth-logs.sh

# Add to crontab for automatic execution
crontab -e
# Add: */5 * * * * /var/www/deskbird-chellange/tools/security/parse-auth-logs.sh
```
