-- Hostel Marketplace Schema for SQLite

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('guest', 'host', 'admin')),
  first_name TEXT,
  last_name TEXT,
  profile_image TEXT,
  phone TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hostels Table
CREATE TABLE IF NOT EXISTS hostels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  host_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  price_per_night REAL NOT NULL,
  image_url TEXT,
  rating REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Hostel Images Table
CREATE TABLE IF NOT EXISTS hostel_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hostel_id INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
);

-- Amenities Table
CREATE TABLE IF NOT EXISTS amenities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  icon TEXT
);

-- Hostel Amenities (Junction Table)
CREATE TABLE IF NOT EXISTS hostel_amenities (
  hostel_id INTEGER NOT NULL,
  amenity_id INTEGER NOT NULL,
  PRIMARY KEY (hostel_id, amenity_id),
  FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE,
  FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hostel_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  total_price REAL NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hostel_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  booking_id INTEGER,
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Favorites Table
CREATE TABLE IF NOT EXISTS favorites (
  user_id INTEGER NOT NULL,
  hostel_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, hostel_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  reference_id INTEGER,
  is_read BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Hostel Availability Table
CREATE TABLE IF NOT EXISTS hostel_availability (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hostel_id INTEGER NOT NULL,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT 1,
  price_override REAL,
  FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE,
  UNIQUE(hostel_id, date)
);

-- Insert default amenities
INSERT OR IGNORE INTO amenities (name, icon) VALUES 
('Free Wi-Fi', 'wifi'),
('Breakfast Included', 'coffee'),
('Air Conditioning', 'snow'),
('24/7 Reception', 'clock'),
('Lockers', 'lock-closed'),
('Common Area', 'users'),
('Kitchen', 'fire'),
('Laundry', 'refresh'),
('Hot Showers', 'cloud-rain'),
('Towels', 'book'),
('Linens', 'bed'),
('Bicycle Rental', 'bicycle');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hostels_host_id ON hostels(host_id);
CREATE INDEX IF NOT EXISTS idx_hostels_location ON hostels(location);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_hostel_id ON bookings(hostel_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_hostel_id ON reviews(hostel_id);
CREATE INDEX IF NOT EXISTS idx_hostel_images_hostel_id ON hostel_images(hostel_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_hostel_availability_hostel_date ON hostel_availability(hostel_id, date); 