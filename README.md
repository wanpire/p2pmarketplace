# Hostel Marketplace

A full-stack web application for booking hostels, featuring user and host dashboards, real-time messaging, and a comprehensive booking system.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Usage](#usage)
  - [User Features](#user-features)
  - [Host Features](#host-features)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

The Hostel Marketplace is a platform that connects travelers with hostel accommodations. Users can search for hostels, make bookings, and communicate with hosts through a real-time messaging system. Hosts can list their properties, manage bookings, and interact with guests.

## Features

### User Features
- Account creation and management
- Search for hostels by location and price
- View detailed hostel information
- Make bookings with date selection
- View booking history (upcoming and past)
- Real-time messaging with hosts
- User dashboard for managing all activities

### Host Features
- Property listing and management
- Booking request management (accept/decline)
- Track bookings and occupancy
- Real-time messaging with guests
- Host dashboard with analytics
- Manage multiple hostels from one account

### Core System Features
- Authentication and authorization
- Real-time notifications
- Search and filtering
- Secure payment processing (integration ready)
- Responsive design for all devices
- Image uploads for hostel listings

## Technologies Used

### Frontend
- React.js
- React Router for navigation
- Tailwind CSS for styling
- Socket.io Client for real-time communication

### Backend
- Node.js
- Express.js
- MongoDB for database
- Socket.io for real-time communication
- JSON Web Tokens (JWT) for authentication

### DevOps
- Git for version control
- PM2 for process management
- Nginx for reverse proxy
- Let's Encrypt for SSL

## Project Structure

```
hostel-marketplace/
├── frontend/                # React frontend application
│   ├── public/              # Static files
│   ├── src/                 # Source files
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── App.js           # Main application component
│   │   └── index.js         # Entry point
│   └── package.json         # Dependencies
│
├── backend/                 # Node.js backend application
│   ├── routes/              # API routes
│   ├── models/              # Database models
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Express middleware
│   ├── chat.js              # Socket.io setup
│   ├── index.js             # Server entry point
│   └── package.json         # Dependencies
│
├── setup                    # Deployment guide
└── README.md                # This file
```

## Getting Started

### Prerequisites

- Node.js (v16.x or higher)
- npm or yarn
- MongoDB (v4.x or higher)
- Git

### Installation

1. Clone the repository
```bash
git clone https://your-repository-url.git hostel-marketplace
cd hostel-marketplace
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Create environment variables (see section below)

5. Start the backend server
```bash
cd ../backend
npm run dev
```

6. Start the frontend application
```bash
cd ../frontend
npm start
```

7. Access the application at `http://localhost:3000`

### Environment Variables

#### Backend (.env)
```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/hostel_marketplace
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

#### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3000/api
```

## Usage

### User Features

#### Registration and Login
- Create a new account or log in with existing credentials
- Profile management to update personal information

#### Searching for Hostels
- Use the search bar to find hostels by location
- Filter results by price and amenities
- View detailed information about each hostel

#### Making Bookings
- Select check-in and check-out dates
- Review booking details and confirm
- Receive confirmation and updates about the booking status

#### Messaging
- Communicate with hosts through the messaging interface
- Receive real-time notifications for new messages

### Host Features

#### Managing Hostels
- Add new hostels with detailed information and images
- Edit existing hostel details
- Remove hostels from the platform

#### Managing Bookings
- View incoming booking requests
- Accept or decline bookings
- Mark bookings as completed
- Communicate with guests regarding their stay

#### Dashboard Analytics
- View occupancy rates and booking statistics
- Track revenue and popular dates

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login a user

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Hostels
- `GET /api/hostels` - Get all hostels
- `GET /api/hostels/search` - Search hostels with filters
- `GET /api/hostels/:id` - Get a specific hostel
- `POST /api/hostels/add` - Add a new hostel
- `PUT /api/hostels/:id` - Update a hostel
- `DELETE /api/hostels/:id` - Delete a hostel

### Bookings
- `POST /api/bookings/add` - Create a new booking
- `GET /api/bookings/user` - Get user's bookings
- `GET /api/bookings/hostel` - Get hostel's bookings
- `PUT /api/bookings/:id/status` - Update booking status

### Messages
- `POST /api/messages/send` - Send a message
- `GET /api/messages` - Get conversation messages
- `GET /api/messages/conversations` - Get user's conversations
- `PUT /api/messages/read` - Mark messages as read

## Deployment

For detailed deployment instructions, see the [setup](./setup) file. Below is a summary of the deployment process:

### Server Requirements
- Ubuntu 22.04 VPS
- 2GB RAM minimum (4GB recommended)
- 20GB storage minimum

### Deployment Steps

1. Set up the server with required software (Node.js, MongoDB, Nginx)
2. Clone the repository and configure environment variables
3. Build the frontend and backend applications
4. Configure Nginx as a reverse proxy
5. Set up SSL/TLS with Let's Encrypt
6. Configure PM2 for process management
7. Set up monitoring and backup procedures

See the full [deployment guide](./setup) for detailed instructions.

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ by [Your Name/Team]
