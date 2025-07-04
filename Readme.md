# Luxury Stay Hotel Management System

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

A comprehensive hotel management system built with React.js and Node.js.

## 📑 Table of Contents

- [Features](#-features)
- [Setup Instructions](#️-setup-instructions)
- [Login Credentials](#-login-credentials)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Architecture](#️-architecture)
- [Technologies Used](#-technologies-used)
- [Project Status](#-project-status)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

## 🎯 Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/daniyalquest/Luxury-Stay.git
   cd luxury-stay
   ```

2. **Follow the setup instructions below for both backend and frontend**

## 🚀 Features

### Core Functionality

- ✅ **User Authentication & Authorization** - Role-based access control
- ✅ **Room Management** - Add, edit, delete rooms with availability tracking
- ✅ **Booking System** - Complete booking workflow with payment status
- ✅ **User Management** - Manage staff and guest accounts
- ✅ **Feedback System** - Customer reviews and ratings
- ✅ **Notifications** - Real-time system notifications
- ✅ **System Settings** - Configurable hotel settings
- ✅ **Invoice Generation** - PDF invoice generation and management

### User Roles

- **Admin** - Full system access
- **Manager** - Operations management
- **Receptionist** - Front desk operations
- **Guest** - Booking and feedback

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to server directory:

   ```bash
   cd server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create `.env` file with your MongoDB connection:

   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   JWT_SECRET=your_jwt_secret_key
   ```

4. Seed the database:

   ```bash
   node seeder.js
   ```

5. Start the server:
   ```bash
   npm start
   ```
   The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to client directory:

   ```bash
   cd client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The application will run on `http://localhost:3000`

> **Note:** Make sure the backend server is running before starting the frontend.

## 🔑 Login Credentials

### Admin Access

- **Email:** admin@luxurystay.com
- **Password:** admin123

### Manager Access

- **Email:** manager@luxurystay.com
- **Password:** manager123

### Receptionist Access

- **Email:** receptionist@luxurystay.com
- **Password:** reception123

### Guest Access

- **Email:** john@guest.com
- **Password:** guest123

## 📋 API Endpoints

### Authentication

- `POST /api/users/login` - User login
- `POST /api/users/register` - User registration

### Rooms

- `GET /api/rooms` - Get all rooms
- `POST /api/rooms` - Create room
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room

### Bookings

- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking

### Users

- `GET /api/users` - Get all users
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 💾 Database Schema

### Collections

- **Users** - User accounts and authentication
- **Rooms** - Room inventory and details
- **Bookings** - Reservation records
- **Invoices** - Billing and payment records
- **Feedback** - Customer reviews
- **ServiceRequests** - Guest service requests
- **SystemSettings** - Application configuration
- **Notifications** - System alerts and messages

## 🏗️ Architecture

### Backend

- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing

### Frontend

- **React.js** with React Router
- **Tailwind CSS** for styling
- **Axios** for API calls
- **Context API** for state management

## 🔧 Technologies Used

- **Frontend:** React.js, Tailwind CSS, React Router
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Authentication:** JWT, bcrypt
- **Development:** Vite, ESLint, Nodemon

## 📊 Database Statistics

After seeding:

- 7 Users (4 Staff + 3 Guests)
- 6 Rooms (Various types and statuses)
- 3 Bookings (Different statuses)
- 2 Service Requests
- 2 Invoices
- 3 Feedback entries
- 10 System Settings
- 4 Notifications

## 🎯 Project Status

**80%+ Complete** - All essential features implemented:

- ✅ Authentication system
- ✅ Room management
- ✅ Booking system
- ✅ User management
- ✅ Feedback system
- ✅ System settings
- ✅ Notifications
- ✅ Invoice generation
- ✅ Role-based access control

## 📝 License

This project is for educational purposes as part of the ADSE II curriculum.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Contact

For any questions or support, please contact:

- **Developer**: Daniyal
- **Institution**: Aptech
- **Course**: ADSE II (Semester 5)

---

**© 2025 Luxury Stay Hotel Management System - Educational Project**
