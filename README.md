# SmartPark System 🚗🚙

SmartPark is a modern, full-stack web application designed to connect Drivers who need parking with Hosts who have extra space (driveways, garages, empty lots). It features an interactive map, a dynamic 16-byte QR code check-in/out logic, a robust Admin dashboard, and an integrated Reviews & Scheduling system.

## 🌟 Features
- **Frontend**: Next.js (React 18), TailwindCSS, Framer Motion, Vanilla CSS (Glassmorphism), Leaflet (Interactive Maps), HTML5-QRCode (Scanner).
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT Authentication.
- **Key Workflows**:
  - **Drivers**: Search by city/GPS, book spaces (immediate or advanced scheduling), view dynamic QR tickets, and leave ratings.
  - **Hosts**: Add parking spots via map-clicks, track earnings, and scan Driver QR codes to start/stop the billing timer.
  - **Admins**: Approve Host applications and monitor platform revenue.

---

## 🚀 Deployment Guide

This project is separated into a standard Node.js `backend` and a Next.js `frontend`. It is strongly recommended to deploy them as two separate services.

### 1. Deploying the Backend (Render / Heroku)

We recommend using **Render.com** (it's free and easy for Node.js).

1. Go to [Render.com](https://render.com) and create a "New Web Service".
2. Connect your GitHub repository.
3. In the setup, set the **Root Directory** to `backend`.
4. Set the **Build Command** to: `npm install`
5. Set the **Start Command** to: `npm start`
6. Add the following **Environment Variables**:
   - `MONGODB_URI`: Your MongoDB Atlas connection string `mongodb+srv://...`
   - `JWT_SECRET`: A secure random string (e.g., `my_super_secret_key_123`)
   - `PORT`: `5000`
   - `CLIENT_URL`: The URL where your frontend will be hosted (e.g., `https://smartpark.vercel.app`)

7. Click **Deploy**. Render will give you a backend URL like `https://smartpark-api.onrender.com`. Save this URL.

### 2. Deploying the Frontend (Vercel)

We recommend using **Vercel** (the creators of Next.js) for the most seamless frontend deployment.

1. Go to [Vercel.com](https://vercel.com) and click "Add New Project".
2. Import your GitHub repository.
3. Set the **Root Directory** to `frontend`.
4. Vercel will automatically detect it is a Next.js framework project. Leave the Build/Start commands default.
5. In the **Environment Variables** section, add:
   - `NEXT_PUBLIC_API_URL`: Your actual deployed backend URL (e.g., `https://smartpark-api.onrender.com/api`)
6. Click **Deploy**. Vercel will build your React application and provide you with a live, global domain!

---

## 💻 Running Locally

If you want to pull the code and run it on your own machine:

1. **Clone the repository.**
2. **Backend**:
   ```bash
   cd backend
   npm install
   # Make sure you create a .env file based on .env.example
   npm run dev
   ```
3. **Frontend**:
   ```bash
   cd frontend
   npm install
   # Make sure you create a .env file based on .env.example
   npm run dev
   ```
4. **Seed the Admin**:
   While the backend is running, open a terminal in `/backend` and run `node createAdmin.js` to initialize the first super-user.
