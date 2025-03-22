# Hostel Marketplace

A full-stack web application for finding and booking hostels worldwide. Built with React, Node.js, Express, and SQLite.

## Features

- User authentication and profile management
- Hostel search with filters for location, price, and amenities
- Detailed hostel listings with images, descriptions, and ratings
- Real-time chat between users and hosts
- Booking management for guests and hosts
- Reviews and ratings system

## Project Structure

```
hostel-marketplace/
├── frontend/           # React frontend
│   ├── public/         # Static files
│   └── src/            # React components and pages
│       ├── components/ # Reusable UI components
│       ├── pages/      # Page components
│       └── services/   # API services
│
└── backend/            # Node.js backend
    ├── controllers/    # Request handlers
    ├── models/         # Data models
    ├── routes/         # API routes
    ├── database/       # Database configuration
    └── chat.js         # Socket.io chat functionality
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/hostel-marketplace.git
   cd hostel-marketplace
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env
   ```
   Edit `.env` with your configuration.

4. Install frontend dependencies:
   ```
   cd ../frontend
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```

2. Start the frontend development server:
   ```
   cd ../frontend
   npm start
   ```

3. Access the application at `http://localhost:3000`

## Database

This project uses SQLite for data storage. The database schema includes:

- Users
- Hostels
- Bookings
- Messages
- Reviews
- Notifications

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ by [Your Name/Team]
