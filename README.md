# 🔐 IA04 – React Authentication with JWT (Access + Refresh Tokens)

A fullstack web application demonstrating **secure authentication** using JWT access tokens and refresh tokens with automatic token renewal.

## 📚 Overview

This project implements a complete **JWT Authentication System** using:

- **Backend:** [NestJS](https://nestjs.com/) + MongoDB (Mongoose) + JWT + Passport
- **Frontend:** [React + Vite](https://vitejs.dev/) + Tailwind CSS + React Query + React Hook Form + Axios
- **Purpose:** Demonstrate production-ready authentication flow with access/refresh tokens, protected routes, and automatic token refresh

---

## 🎯 Key Features

### 🔑 Authentication Flow
- ✅ User registration with password hashing (bcrypt)
- ✅ Login with JWT access token (15 min expiry) and refresh token (7 days expiry)
- ✅ Automatic token refresh when access token expires
- ✅ Secure logout with token invalidation
- ✅ Protected routes requiring valid authentication

### 🛡️ Security Features
- ✅ Access tokens stored in memory (not localStorage)
- ✅ Refresh tokens stored in localStorage
- ✅ Hashed refresh tokens in database
- ✅ Axios interceptors for automatic token attachment and refresh
- ✅ 401 Unauthorized handling with automatic retry after refresh

### 🎨 Frontend Features
- ✅ React Hook Form for form validation
- ✅ React Query for server state management
- ✅ Protected routes with automatic redirect to login
- ✅ Return URL preservation (redirect back after login)
- ✅ Real-time auth state management with Context API
- ✅ Responsive UI with Tailwind CSS

---

## 🏗️ Project Structure

```
ia04-react-authentication-with-JWT/
├── backend/              # NestJS API
│   ├── src/
│   │   ├── auth/        # JWT authentication module
│   │   │   ├── strategies/  # Passport JWT strategies
│   │   │   ├── guards/      # Auth guards
│   │   │   └── dto/         # Data transfer objects
│   │   ├── user/        # User management module
│   │   └── config/      # Configuration files
│   └── .env
│
└── frontend/            # React + Vite app
    ├── src/
    │   ├── api/         # Axios instance with interceptors
    │   ├── components/  # Reusable UI components
    │   │   ├── forms/   # Login & SignUp forms
    │   │   ├── layout/  # Navbar
    │   │   └── ui/      # Button, Input components
    │   ├── contexts/    # Auth context for global state
    │   ├── hooks/       # React Query hooks
    │   ├── pages/       # Page components
    │   ├── routes/      # Router & ProtectedRoute
    │   └── utils/       # Utility functions
    └── .env
```

---

## ⚙️ Installation Guide

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (running locally or Atlas URI)
- npm or yarn

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/mandeotv1234/ia04-react-authentication-with-JWT.git
cd ia04-react-authentication-with-JWT
```

---

## 🧠 Backend Setup (NestJS)

### 1. Navigate to backend folder
```bash
cd backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables  
Create a `.env` file in `/backend`:
```env
MONGO_URI=mongodb+srv://donalmun:eqia8yO1F0G3oBVx@tkpm.vufuh.mongodb.net/ex01?retryWrites=true&w=majority&appName=ex01
PORT=3000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-min-32-chars
```

⚠️ **Important:** Use strong, unique secrets in production!

### 4. Run the server
```bash
npm run start:dev
```

The backend will start at  
👉 **http://localhost:3000**

#### Backend API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/user/register` | Register new user | ❌ |
| POST | `/auth/login` | Login and get tokens | ❌ |
| POST | `/auth/refresh` | Refresh access token | ✅ (Refresh Token) |
| POST | `/auth/logout` | Logout and invalidate tokens | ✅ (Access Token) |
| GET | `/auth/profile` | Get user profile | ✅ (Access Token) |

---

## 💻 Frontend Setup (React + Vite)

### 1. Navigate to frontend folder
```bash
cd ../frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in `/frontend`:
```env
VITE_API_URL=http://localhost:3000
```

### 4. Start development server
```bash
npm run dev
```

The frontend will start at  
👉 **http://localhost:5173**

---

## 🔗 Authentication Flow

### 1. Registration Flow
```
User → Register Form → POST /user/register → Password hashed → User created
```

### 2. Login Flow
```
User → Login Form → POST /auth/login → Verify credentials
  ↓
Generate Access Token (15 min) + Refresh Token (7 days)
  ↓
Store Access Token in memory + Refresh Token in localStorage
  ↓
Redirect to Dashboard
```

### 3. Protected Route Access
```
User clicks Dashboard → ProtectedRoute checks token
  ↓
  ├─ Token exists → Allow access
  └─ No token → Redirect to /login (with return URL)
```

### 4. Automatic Token Refresh
```
User makes API request → Axios interceptor adds Access Token
  ↓
  ├─ 200 OK → Request successful
  └─ 401 Unauthorized → Access Token expired
      ↓
      POST /auth/refresh with Refresh Token
      ↓
      ├─ Success → Get new tokens → Retry original request
      └─ Fail → Logout → Redirect to /login
```

### 5. Logout Flow
```
User clicks Logout → POST /auth/logout → Invalidate refresh token in DB
  ↓
Clear tokens from memory & localStorage → Redirect to /login
```

---

## 🎨 Pages Implemented

| Page | Route | Description | Auth Required |
|------|-------|-------------|---------------|
| Home | `/` | Landing page | ❌ |
| Sign Up | `/signup` | User registration form | ❌ |
| Login | `/login` | User login form | ❌ |
| Dashboard | `/dashboard` | User dashboard with profile | ✅ |

---

## 🔧 Technical Implementation

### Axios Interceptor Pattern

```typescript
// Request Interceptor: Attach access token
api.interceptors.request.use(config => {
  const token = window.__accessToken__;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle 401 and refresh
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Refresh token logic here
      const newToken = await refreshAccessToken();
      // Retry original request with new token
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);
```

### React Query Integration

```typescript
// Login mutation
const mutation = useLoginMutation();
mutation.mutate({ email, password });

// Profile query with automatic refetch
const { data: profile } = useProfileQuery();
```

### Protected Route Component

```typescript
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

---

## 🌐 Deployment

### Backend Deployment (Render / Railway / Heroku)

1. Push code to GitHub
2. Create new service on hosting platform
3. Add environment variables:
   - `MONGO_URI` (MongoDB Atlas URI)
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `FRONTEND_URL` (your deployed frontend URL)
4. Deploy from GitHub repository

### Frontend Deployment (Vercel / Netlify)

1. Push code to GitHub
2. Create new project on hosting platform
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variable:
   - `VITE_API_URL` (your deployed backend URL)
6. Deploy

### Example Deployed URLs
- **Backend:** https://ia04-react-authentication-with-jwt-orcin.vercel.app/
- **Frontend:** https://ia04-react-authentication-with-jwt.vercel.app/

---

## 🧪 Testing the Application

### Test Scenario 1: Registration & Login
1. Navigate to `/signup`
2. Register with email & password
3. Redirected to login with success message
4. Login with credentials
5. Redirected to `/dashboard`

### Test Scenario 2: Token Refresh
1. Login successfully
2. Wait 15+ minutes (or modify token expiry to 1 min for testing)
3. Make any API request (refresh page, navigate)
4. Token automatically refreshes in background
5. Request succeeds without re-login

### Test Scenario 3: Protected Route
1. **Without login:** Try accessing `/dashboard`
   - Should redirect to `/login`
   - After login, redirects back to `/dashboard`
2. **After logout:** Access token cleared, redirects to login

### Test Scenario 4: Multi-tab Behavior
1. Login in Tab 1
2. Open Tab 2 → Dashboard accessible
3. Logout in Tab 1
4. Refresh Tab 2 → Automatically logged out

---

## 📦 Dependencies

### Backend
```json
{
  "@nestjs/jwt": "^10.x",
  "@nestjs/passport": "^10.x",
  "passport-jwt": "^4.x",
  "bcrypt": "^5.x",
  "mongoose": "^8.x"
}
```

### Frontend
```json
{
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "@tanstack/react-query": "^5.x",
  "react-hook-form": "^7.x",
  "axios": "^1.x",
  "tailwindcss": "^3.x"
}
```

---

## 🎓 Learning Outcomes

After completing this project, you will understand:

✅ **JWT Authentication:** Access tokens vs refresh tokens  
✅ **Security Best Practices:** Token storage, hashing, expiration  
✅ **Axios Interceptors:** Request/response interception and retry logic  
✅ **React Query:** Server state management and cache invalidation  
✅ **React Hook Form:** Form validation and error handling  
✅ **Protected Routes:** Authorization and route guarding  
✅ **Context API:** Global authentication state management  
✅ **TypeScript:** Strong typing for API contracts  

---

## 🚀 Stretch Goals (Optional)

- [ ] Silent token refresh (before expiration)
- [ ] Cookie-based refresh token storage
- [ ] Multi-tab synchronization (logout reflects across tabs)
- [ ] Role-based access control (RBAC)
- [ ] Email verification flow
- [ ] Password reset functionality
- [ ] Remember me checkbox
- [ ] Session management dashboard

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module '@nestjs/jwt'"
**Solution:** Run `npm install` in backend folder

### Issue: "CORS error"
**Solution:** Check `FRONTEND_URL` in backend `.env` matches frontend URL

### Issue: "Token expired" immediately
**Solution:** Check system time is correct, or increase token expiry for testing

### Issue: "Refresh token not working"
**Solution:** Ensure refresh token is sent in Authorization header

---

## 👨‍💻 Author

**Your Name**  
Software Engineering Student – University of Science, VNUHCM  
📧 22120201@student.hcmus.edu.vn  

---

## 📄 License

This project is created for educational purposes as part of the **IA04 – React Authentication with JWT** assignment.

MIT License - feel free to use this as a reference for your own projects!

---

## 🙏 Acknowledgments

- NestJS Documentation
- React Query Documentation
- Axios Documentation
- React Hook Form Documentation
- JWT.io for token debugging

---

## 📞 Support

If you encounter any issues or have questions:

1. Check the **Common Issues** section above
2. Review backend logs: `npm run start:dev`
3. Check browser console for frontend errors
4. Verify `.env` files are configured correctly
5. Ensure MongoDB is running

---

**Happy Coding! 🎉**
