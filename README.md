# LinkSnip

A full-stack URL shortener that lets users create short links, manage them through a dashboard, track click analytics, and generate QR codes.

Built with React, Node.js, Express, MongoDB, and TypeScript because apparently humans looked at long URLs and decided they were the real problem.

## Features

* Custom short URLs and aliases
* User authentication with JWT
* Guest URL shortening support
* QR code generation for shortened links
* Detailed analytics for clicks

  * Browser
  * Device type
  * Operating system
  * Click count
* Responsive modern UI with dark glassmorphism styling
* Protected dashboard for managing links
* REST API backend with MongoDB

## Tech Stack

### Frontend

* React
* Vite
* TypeScript
* Tailwind CSS
* React Router
* Axios
* Lucide React

### Backend

* Node.js
* Express.js
* TypeScript
* MongoDB
* Mongoose
* JWT Authentication
* bcryptjs

## Project Structure

```bash
LinkSnip/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── server.ts
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── .gitignore
├── README.md
└── package.json
```

## Screenshots

Add screenshots of:

1. Home page
2. Login / Signup page
3. Dashboard
4. Analytics page
5. QR code generation

Nothing convinces people a project works like aggressively posting screenshots of it working.

## Environment Variables

Create a `.env` file inside the backend folder.

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/urlshortener
JWT_SECRET=your_super_secret_key
BASE_URL=http://localhost:5000
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/LinkSnip.git
cd LinkSnip
```

### 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend runs on:

```bash
http://localhost:5000
```

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

## API Endpoints

### Auth Routes

```bash
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

### URL Routes

```bash
POST /api/url/shorten
GET /:shortCode
GET /api/url/user
DELETE /api/url/:id
```

### Analytics Routes

```bash
GET /api/analytics/:shortCode
```

## Future Improvements

* Custom domains
* Expiry date for shortened links
* Password-protected URLs
* Rate limiting and abuse protection
* Link editing support
* Export analytics as CSV
* Team collaboration features
* Public API keys for developers

## Deployment

You can deploy:

* Frontend on Vercel
* Backend on Render, Railway, or Cyclic
* Database on MongoDB Atlas

## License

This project is licensed under the MIT License.

---

Made with React, Express, MongoDB, TypeScript, and a completely unnecessary amount of determination for something that turns long links into short ones.

