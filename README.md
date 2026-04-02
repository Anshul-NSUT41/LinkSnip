# LinkSnip - Full Stack URL Shortener

A modern, functional, full-stack URL shortener built with React, Node.js, Express, and MongoDB.

## Features
- ✂️ URL Shortening with custom aliases
- 📊 Detailed click analytics (browsers, devices, OS)
- 🔒 Secure JWT authentication
- 💻 Modern Glassmorphism dark UI with Tailwind CSS
- 📱 Responsive design
- 🔄 QR Code generation

## Tech Stack
- **Frontend:** React (Vite), TypeScript, Tailwind CSS, React Router, Lucide React, Axios
- **Backend:** Node.js, Express, TypeScript, MongoDB (Mongoose), JWT, bcryptjs

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB running locally or a MongoDB Atlas URI

### 1. Database Setup
Ensure MongoDB is running locally on `mongodb://localhost:27017/urlshortener` or you have your MongoDB cluster URL ready.

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   A `.env` file is already provided with defaults, but you can configure `MONGODB_URI` or `JWT_SECRET` as needed.
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```

### 4. Open Application
Open your browser and navigate to `http://localhost:5173`. You can start shortening URLs immediately as a guest, or create an account for a dashboard and analytics!

## Development Commands
- Backend: `npm run dev` (starts on port 5000)
- Frontend: `npm run dev` (starts on port 5173)

## Folder Structure
- `backend/` - Node.js Express server with Mongoose models, controllers, algorithms
- `frontend/` - React frontend with TailwindCSS UI components, context API for auth, and routing
