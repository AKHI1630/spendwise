# SpendWise – Personal Expense Tracker

> Take control of your money.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-brightgreen.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://mongodb.com/atlas)

---

## Overview

SpendWise is a full-stack personal expense tracking application that helps individuals manage their daily finances. Track income and expenses, categorize transactions, monitor your balance in real time, and gain insights through interactive charts and analytics.

Built as a college full-stack web development assignment demonstrating:
- **HTML5 + CSS3** – Responsive, modern UI
- **JavaScript ES6+** – Clean, readable code
- **ReactJS** – Component-based frontend with Vite
- **Node.js + Express.js** – RESTful API backend
- **MongoDB + Mongoose** – Document database with ODM
- **JWT Authentication** – Secure, stateless auth
- **Vercel** – Full-stack deployment

---

## Problem Statement

Managing personal finances manually is tedious and error-prone. Most people lack clear visibility into where their money goes each month. SpendWise solves this by providing a clean, intuitive platform to record, categorize, and analyze all financial transactions in one place.

---

## Features

- **Authentication** – Register, login, JWT-protected routes, bcrypt password hashing
- **Dashboard** – Real-time balance, monthly income/expense/savings summary, recent transactions
- **Transaction Management** – Full CRUD: create, read, update, delete transactions
- **Smart Filtering** – Filter by type, category, date range, search by title
- **Interactive Charts** – Income vs Expenses bar chart, spending donut chart, monthly trends
- **Analytics** – Category breakdown, average expense, savings rate, spending trends
- **Responsive Design** – Works on desktop, tablet, and mobile
- **Settings** – Update profile, change password

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, React Router DOM v6 |
| Styling | CSS3 with CSS Variables, Inter Font |
| Charts | Recharts |
| Icons | Lucide React |
| HTTP Client | Axios |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcryptjs |
| Security | Helmet, express-rate-limit |
| Deployment | Vercel (frontend + serverless backend) |

---

## Project Structure

```
spendwise/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Register, login, me
│   │   ├── transactionController.js
│   │   ├── dashboardController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js               # JWT protect middleware
│   │   └── errorHandler.js       # Global error handler
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── Transaction.js        # Transaction schema
│   ├── routes/
│   │   ├── auth.js
│   │   ├── transactions.js
│   │   ├── dashboard.js
│   │   └── users.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/               # Global CSS
│   │   ├── components/           # Reusable UI components
│   │   ├── context/              # Auth + Toast context
│   │   ├── layouts/              # App layout
│   │   ├── pages/                # Route pages
│   │   ├── services/             # API service layer
│   │   ├── utils/                # Helpers
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── vercel.json
├── .gitignore
└── README.md
```

---

## MongoDB Schema

### User

```json
{
  "_id": "ObjectId",
  "name": "String (required)",
  "email": "String (required, unique)",
  "password": "String (hashed, bcrypt)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Transaction

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: User)",
  "title": "String (required)",
  "amount": "Number (required, > 0)",
  "type": "String (enum: income | expense)",
  "category": "String (enum: 16 categories)",
  "date": "Date (required)",
  "description": "String (optional)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## API Endpoints

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Transactions

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/transactions` | Get all user transactions | Yes |
| POST | `/api/transactions` | Create transaction | Yes |
| GET | `/api/transactions/:id` | Get single transaction | Yes |
| PUT | `/api/transactions/:id` | Update transaction | Yes |
| DELETE | `/api/transactions/:id` | Delete transaction | Yes |

**Query params for GET /api/transactions:**
- `type` – income | expense
- `category` – category name
- `search` – title search
- `startDate`, `endDate` – date range (YYYY-MM-DD)
- `sort` – -date (default) | date
- `page`, `limit` – pagination

### Dashboard

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/dashboard/summary` | Balance + monthly stats + recent txns | Yes |
| GET | `/api/dashboard/category-breakdown` | Expense by category | Yes |
| GET | `/api/dashboard/monthly-trends` | 6-month income/expense trends | Yes |

**Query params:** `month` (1-12), `year` (YYYY)

### Settings

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| PUT | `/api/users/profile` | Update name/email | Yes |
| PUT | `/api/users/change-password` | Change password | Yes |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | API health check |

---

## Installation & Setup

### Prerequisites

- Node.js >= 18
- npm or pnpm
- MongoDB Atlas account (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/spendwise.git
cd spendwise
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
```

### 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local if needed
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/spendwise?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRE=7d
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env.local`)

```env
VITE_API_URL=http://localhost:5000/api
```

> In production on Vercel, the frontend uses relative `/api` paths which are handled by the Vercel routing configuration.

---

## Running Locally

### Start backend

```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

### Start frontend

```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## GitHub Setup

```bash
git init
git add .
git commit -m "Initial commit: SpendWise full-stack app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/spendwise.git
git push -u origin main
```

---

## Vercel Deployment

### Option A: Vercel CLI

```bash
npm install -g vercel
cd spendwise
vercel
```

### Option B: Vercel Dashboard

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Set root directory to `/` (uses vercel.json)
4. Add environment variables in Vercel dashboard:
   - `MONGODB_URI` – your MongoDB Atlas connection string
   - `JWT_SECRET` – a strong random secret
   - `JWT_EXPIRE` – `7d`
   - `NODE_ENV` – `production`
   - `CLIENT_URL` – your Vercel frontend URL

### Environment Variables on Vercel

In Vercel Dashboard → Project → Settings → Environment Variables, add:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | `mongodb+srv://...` |
| `JWT_SECRET` | `your-secret-key` |
| `JWT_EXPIRE` | `7d` |
| `NODE_ENV` | `production` |

> MongoDB Atlas: Ensure your Atlas cluster Network Access allows `0.0.0.0/0` (all IPs) or specifically Vercel's IP ranges.

---

## MongoDB Atlas Setup

1. Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free M0 cluster
3. Create a database user with read/write access
4. Add `0.0.0.0/0` to Network Access (allow all IPs for Vercel serverless)
5. Get your connection string: Cluster → Connect → Drivers
6. Replace `<username>` and `<password>` in the connection string

---

## Live Demo

- **Frontend**: [https://YOUR-PROJECT.vercel.app](https://YOUR-PROJECT.vercel.app) *(Add after deployment)*
- **API**: [https://YOUR-PROJECT.vercel.app/api/health](https://YOUR-PROJECT.vercel.app/api/health) *(Add after deployment)*
- **GitHub**: [https://github.com/YOUR_USERNAME/spendwise](https://github.com/YOUR_USERNAME/spendwise) *(Add after pushing)*

---

## Screenshots

*Add screenshots after deployment*

- Landing Page
- Dashboard
- Transactions
- Analytics
- Settings

---

## Future Enhancements

- [ ] Budget goal setting and alerts
- [ ] CSV/PDF export of transactions
- [ ] Recurring transaction support
- [ ] Multiple currency support
- [ ] Email notifications for spending limits
- [ ] Dark mode
- [ ] Mobile app (React Native)
- [ ] OAuth (Google login)

---

## License

MIT License – feel free to use this project for educational purposes.

---

## Author

Built with care as a college full-stack development assignment demonstrating the MERN stack.

