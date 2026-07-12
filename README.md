# AssetFlow — Enterprise Asset & Resource Management System

AssetFlow is a production-ready MERN stack web application designed to track, allocate, and maintain physical assets and shared resources (rooms, vehicles, equipment) in an organization.

## Folder Structure

```text
assetflow/
├── server/               # Express + Mongoose API Server
│   ├── src/
│   │   ├── config/       # DB Connection Setup
│   │   ├── models/       # Mongoose Schemas (User, Department, AssetCategory)
│   │   ├── middleware/   # Auth, Role guards, and Error handlers
│   │   ├── utils/        # ApiError, ApiResponse, asyncHandler, token generators
│   │   ├── app.js        # Express application mapping
│   │   └── server.js     # Server bootstrap and DB connection point
│   ├── .env.example      # Example environment variables
│   └── package.json
├── client/               # React + Vite + Tailwind CSS Frontend SPA
│   ├── src/
│   │   ├── api/          # Axios configurations and interception
│   │   ├── components/   # Common shells, navigation, Layout UI
│   │   ├── context/      # React contexts (Authentication & Authorization state)
│   │   ├── pages/        # Route page views (Dashboard, Login, Admin Panels)
│   │   ├── routes/       # Route guards (ProtectedRoute)
│   │   ├── App.jsx       # Route maps
│   │   ├── main.jsx      # Vite injection point
│   │   └── index.css     # Global styles & Tailwind imports
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
└── README.md
```

---

## Setup & Installation

### Prerequisite

Ensure you have [Node.js](https://nodejs.org/) (v16+ recommended) and a running instance of [MongoDB](https://www.mongodb.com/) (local or MongoDB Atlas).

### 1. Backend Server Setup

Navigate to the `server` folder:
```bash
cd server
```

Copy the environment example file and configure variables:
```bash
cp .env.example .env
```
Open `.env` and enter your database details and JWT secret configuration.

Install packages:
```bash
npm install
```

Start the backend server in development mode:
```bash
npm run dev
```
The server will run on `http://localhost:5000` (or your configured `PORT`).

---

### 2. Frontend Client Setup

Navigate to the `client` folder:
```bash
cd ../client
```

Install packages:
```bash
npm install
```

Start the frontend Vite dev server:
```bash
npm run dev
```
By default, the client will run on `http://localhost:5173`. You can log in on the login page using the sandbox quick access buttons to test different roles.

---

## Environment Variables

### Backend Configuration (`server/.env`)

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `PORT` | Listening port of the API server | `5000` |
| `MONGO_URI` | MongoDB Connection URI string | `mongodb://localhost:27017/assetflow` |
| `JWT_SECRET` | Secret token to sign JSON Web Tokens | `supersecretkeychangeinprod` |
| `JWT_EXPIRES_IN` | Duration before JWT expires | `7d` |
| `CLIENT_ORIGIN` | Allowed origin for CORS validation | `http://localhost:5173` |
| `NODE_ENV` | Running node environment context | `development` |

### Frontend Configuration (`client/.env` - Optional)

| Variable | Description | Default / Example Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base API address targeting the backend | `http://localhost:5000/api` |
