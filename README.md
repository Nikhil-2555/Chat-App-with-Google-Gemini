# ChatApp

A real-time chat application built with React (Frontend) and Node.js/Express (Backend).

## 🚀 Features

- User Authentication (Login/Register)
- JWT-based authorization
- User Context for state management
- Beautiful UI with Tailwind CSS
- Glassmorphism design
- Redis for session management
- MongoDB database

## 📁 Project Structure

```
ChatApp/
├── backend/          # Node.js/Express backend
│   ├── controllers/  # Request handlers
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   ├── services/     # Business logic
│   └── middleware/   # Auth middleware
│
└── frontend/         # React frontend
    ├── src/
    │   ├── components/
    │   ├── context/  # User context
    │   ├── routes/   # App routing
    │   └── screens/  # Login, Register pages
    └── public/
```

## 🛠️ Installation

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
REDIS_HOST=localhost
REDIS_PORT=6379
```

Start the backend server:
```bash
node server.js
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
VITE_BASE_URL=http://localhost:3000
```

Start the frontend development server:
```bash
npm run dev
```

## 🌐 Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## 🔑 Environment Variables

### Backend
- `PORT` - Server port (default: 3000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `REDIS_HOST` - Redis host
- `REDIS_PORT` - Redis port

### Frontend
- `VITE_BASE_URL` - Backend API URL

## 📦 Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- Redis
- JWT (jsonwebtoken)
- bcrypt
- CORS

### Frontend
- React 19
- Vite
- Tailwind CSS 4
- React Router DOM
- Axios
- Lucide React (icons)

## 🎨 UI Features

- Glassmorphism design
- Gradient backgrounds
- Smooth animations
- Responsive layout
- Loading states
- Error handling

## 📝 API Endpoints

- `POST /users/register` - Register new user
- `POST /users/login` - Login user
- `GET /users/profile` - Get user profile (protected)
- `GET /users/logout` - Logout user (protected)

## 👨‍💻 Author

Built with ❤️ using React and Node.js

## 📄 License

MIT
