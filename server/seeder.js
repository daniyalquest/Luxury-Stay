import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './Config/db.js';

// Import all models
import User from './models/User.js';
import Room from './models/Room.js';
import Booking from './models/Booking.js';
import ServiceRequest from './models/ServiceRequest.js';
import Invoice from './models/Invoice.js';
import Feedback from './models/Feedback.js';
import Maintenance from './models/Maintenance.js';
import Housekeeping from './models/Housekeeping.js';
import SystemSettings from './models/SystemSettings.js';
import Notification from './models/Notification.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      User.deleteMany(),
      Room.deleteMany(),
      Booking.deleteMany(),
      ServiceRequest.deleteMany(),
      Invoice.deleteMany(),
      Feedback.deleteMany(),
      Maintenance.deleteMany(),
      Housekeeping.deleteMany(),
      SystemSettings.deleteMany(),
      Notification.deleteMany()
    ]);

    // 1. Create Users (passwords will be hashed automatically by the User model)
    console.log('👥 Creating users...');
    const userSeedData = [
      {
        name: 'Admin User',
        email: 'admin@luxurystay.com',
        role: 'admin',
        password: 'admin123',
        phone: '03001234567',
        address: {
          street: 'Admin Office',
          city: 'Lahore',
          state: 'Punjab',
          country: 'Pakistan'
        }
      },
      {
        name: 'Hotel Manager',
        email: 'manager@luxurystay.com',
        role: 'manager',
        password: 'manager123',
        phone: '03001234568',
        address: {
          street: 'Manager Office',
          city: 'Lahore',
          state: 'Punjab',
          country: 'Pakistan'
        }
      },
      {
        name: 'Front Desk',
        email: 'receptionist@luxurystay.com',
        role: 'receptionist',
        password: 'reception123',
        phone: '03001234569',
        address: {
          street: 'Front Desk',
          city: 'Lahore',
          state: 'Punjab',
          country: 'Pakistan'
        }
      },
      {
        name: 'Housekeeping Staff',
        email: 'housekeeping@luxurystay.com',
        role: 'housekeeping',
        password: 'house123',
        phone: '03001234570',
        address: {
          street: 'Housekeeping Department',
          city: 'Lahore',
          state: 'Punjab',
          country: 'Pakistan'
        }
      },
      {
        name: 'John Doe',
        email: 'john@guest.com',
        role: 'guest',
        password: 'guest123',
        phone: '03001234571',
        address: {
          street: '123 Main Street',
          city: 'Karachi',
          state: 'Sindh',
          country: 'Pakistan'
        }
      },
      {
        name: 'Jane Smith',
        email: 'jane@guest.com',
        role: 'guest',
        password: 'guest123',
        phone: '03001234572',
        address: {
          street: '456 Oak Avenue',
          city: 'Lahore',
          state: 'Punjab',
          country: 'Pakistan'
        }
      },
      {
        name: 'Ahmed Ali',
        email: 'ahmed@guest.com',
        role: 'guest',
        password: 'guest123',
        phone: '03001234573',
        address: {
          street: '789 Pine Road',
          city: 'Islamabad',
          state: 'Federal',
          country: 'Pakistan'
        }
      }
    ];
    const users = [];
    for (const userData of userSeedData) {
      const user = await User.create(userData);
      users.push(user);
    }

    // 2. Create Rooms
    console.log('🏨 Creating rooms...');
    const rooms = await Room.insertMany([
      {
        roomNumber: '101',
        type: 'Standard',
        status: 'Available',
        price: 8000,
        floor: 1,
        description: 'Comfortable standard room with city view',
        bedType: 'Single',
        capacity: { adults: 1, children: 0 },
        features: {
          wifi: true,
          airConditioning: true,
          miniBar: false,
          balcony: false,
          seaView: false,
          smoking: false
        },
        amenities: [
          { name: 'Free WiFi', description: 'High-speed internet' },
          { name: 'AC', description: 'Climate control' }
        ]
      },
      {
        roomNumber: '102',
        type: 'Standard',
        status: 'Available',
        price: 8000,
        floor: 1,
        description: 'Comfortable standard room',
        bedType: 'Double',
        capacity: { adults: 2, children: 1 },
        features: {
          wifi: true,
          airConditioning: true,
          miniBar: false,
          balcony: false,
          seaView: false,
          smoking: false
        },
        amenities: [
          { name: 'Free WiFi', description: 'High-speed internet' },
          { name: 'AC', description: 'Climate control' }
        ]
      },
      {
        roomNumber: '201',
        type: 'Deluxe',
        status: 'Available',
        price: 12000,
        floor: 2,
        description: 'Deluxe room with premium amenities',
        bedType: 'Queen',
        capacity: { adults: 2, children: 1 },
        features: {
          wifi: true,
          airConditioning: true,
          miniBar: true,
          balcony: true,
          seaView: false,
          smoking: false
        },
        amenities: [
          { name: 'Free WiFi', description: 'High-speed internet' },
          { name: 'Mini Bar', description: 'Complimentary refreshments' },
          { name: 'Balcony', description: 'Private outdoor space' }
        ]
      },
      {
        roomNumber: '202',
        type: 'Deluxe',
        status: 'Occupied',
        price: 12000,
        floor: 2,
        description: 'Deluxe room with city view',
        bedType: 'Queen',
        capacity: { adults: 2, children: 1 },
        features: {
          wifi: true,
          airConditioning: true,
          miniBar: true,
          balcony: true,
          seaView: false,
          smoking: false
        },
        amenities: [
          { name: 'Free WiFi', description: 'High-speed internet' },
          { name: 'Mini Bar', description: 'Complimentary refreshments' },
          { name: 'Balcony', description: 'Private outdoor space' }
        ]
      },
      {
        roomNumber: '301',
        type: 'Suite',
        status: 'Available',
        price: 20000,
        floor: 3,
        description: 'Luxury suite with separate living area',
        bedType: 'King',
        capacity: { adults: 4, children: 2 },
        features: {
          wifi: true,
          airConditioning: true,
          miniBar: true,
          balcony: true,
          seaView: true,
          smoking: false
        },
        amenities: [
          { name: 'Free WiFi', description: 'High-speed internet' },
          { name: 'Mini Bar', description: 'Premium refreshments' },
          { name: 'Sea View', description: 'Panoramic ocean view' },
          { name: 'Living Area', description: 'Separate seating area' }
        ]
      },
      {
        roomNumber: '302',
        type: 'Suite',
        status: 'Maintenance',
        price: 20000,
        floor: 3,
        description: 'Presidential suite with premium amenities',
        bedType: 'King',
        capacity: { adults: 4, children: 2 },
        features: {
          wifi: true,
          airConditioning: true,
          miniBar: true,
          balcony: true,
          seaView: true,
          smoking: false
        },
        amenities: [
          { name: 'Free WiFi', description: 'High-speed internet' },
          { name: 'Mini Bar', description: 'Premium refreshments' },
          { name: 'Sea View', description: 'Panoramic ocean view' },
          { name: 'Jacuzzi', description: 'Private hot tub' }
        ]
      }
    ]);

    // 3. Create Bookings
    console.log('📅 Creating bookings...');
    const guestUsers = users.filter(user => user.role === 'guest');
    // Only book rooms 202 and 301, leave 101, 102, 201 as Available
    const bookings = await Booking.insertMany([
      {
        guest: guestUsers[0]._id,
        room: rooms[3]._id, // Room 202 (Occupied)
        checkInDate: new Date('2024-12-01'),
        checkOutDate: new Date('2024-12-05'),
        numberOfGuests: { adults: 2, children: 0 },
        totalAmount: 48000,
        status: 'CheckedIn',
        paymentStatus: 'Paid',
        specialRequests: 'Late check-in preferred'
      },
      {
        guest: guestUsers[2]._id,
        room: rooms[4]._id, // Room 301 (Suite)
        checkInDate: new Date('2024-12-20'),
        checkOutDate: new Date('2024-12-25'),
        numberOfGuests: { adults: 2, children: 1 },
        totalAmount: 100000,
        status: 'Reserved',
        paymentStatus: 'Pending',
        specialRequests: 'Anniversary celebration'
      }
    ]);

    // 4. Create Service Requests
    console.log('🛎️ Creating service requests...');
    await ServiceRequest.insertMany([
      {
        booking: bookings[0]._id,
        guest: guestUsers[0]._id,
        type: 'Room Service',
        description: 'Extra towels and pillows',
        priority: 'Medium',
        status: 'Pending',
        requestedTime: new Date()
      },
      {
        booking: bookings[0]._id,
        guest: guestUsers[0]._id,
        type: 'Maintenance',
        description: 'AC not working properly',
        priority: 'High',
        status: 'In Progress',
        requestedTime: new Date(Date.now() - 3600000), // 1 hour ago
        assignedTo: users.find(u => u.role === 'housekeeping')._id
      }
    ]);

    // 5. Create Invoices
    console.log('💰 Creating invoices...');
    await Invoice.insertMany([
      {
        booking: bookings[0]._id,
        guest: guestUsers[0]._id,
        invoiceNumber: 'INV-2024-001',
        items: [
          {
            description: 'Room Charges (4 nights)',
            quantity: 4,
            unitPrice: 12000,
            total: 48000
          }
        ],
        subtotal: 48000,
        tax: 4800,
        total: 52800,
        totalAmount: 52800, // Added totalAmount field
        status: 'paid',
        paidAt: new Date('2024-12-01')
      },
      {
        booking: bookings[1]._id,
        guest: guestUsers[1]._id,
        invoiceNumber: 'INV-2024-002',
        items: [
          {
            description: 'Room Charges (3 nights)',
            quantity: 3,
            unitPrice: 8000,
            total: 24000
          }
        ],
        subtotal: 24000,
        tax: 2400,
        total: 26400,
        totalAmount: 26400, // Added totalAmount field
        status: 'pending'
      }
    ]);

    // 6. Create Feedback
    console.log('📝 Creating feedback...');
    await Feedback.insertMany([
      {
        guest: guestUsers[0]._id,
        user: guestUsers[0]._id, // Added user field
        booking: bookings[0]._id,
        rating: 5,
        comment: 'Excellent service and very clean rooms. Staff was very helpful!',
        category: 'Service',
        status: 'approved'
      },
      {
        guest: guestUsers[1]._id,
        user: guestUsers[1]._id, // Added user field
        rating: 4,
        comment: 'Good location and comfortable rooms. Could improve breakfast options.',
        category: 'Food',
        status: 'approved'
      },
      {
        guest: guestUsers[2]._id,
        user: guestUsers[2]._id, // Added user field
        rating: 3,
        comment: 'Average experience. Room was okay but check-in process was slow.',
        category: 'Service',
        status: 'pending'
      }
    ]);

    // 7. Create System Settings
    console.log('⚙️ Creating system settings...');
    await SystemSettings.insertMany([
      {
        category: 'General',
        key: 'hotel_name',
        value: 'Luxury Stay Hotel',
        description: 'Hotel name displayed throughout the system'
      },
      {
        category: 'General',
        key: 'hotel_address',
        value: 'Main Boulevard, Gulberg, Lahore, Pakistan',
        description: 'Hotel address for invoices and documents'
      },
      {
        category: 'General',
        key: 'hotel_phone',
        value: '+92-42-1234567',
        description: 'Hotel contact number'
      },
      {
        category: 'General',
        key: 'hotel_email',
        value: 'info@luxurystay.com',
        description: 'Hotel email address'
      },
      {
        category: 'Policies', // changed from Booking
        key: 'advance_booking_days',
        value: '365',
        description: 'Maximum days in advance for bookings'
      },
      {
        category: 'Policies', // changed from Booking
        key: 'cancellation_hours',
        value: '24',
        description: 'Hours before check-in for free cancellation'
      },
      {
        category: 'Billing', // changed from Financial
        key: 'tax_rate',
        value: '0.10',
        description: 'Tax rate applied to all bookings'
      },
      {
        category: 'Billing', // changed from Financial
        key: 'currency',
        value: 'PKR',
        description: 'Default currency'
      },
      {
        category: 'Policies', // changed from Policy
        key: 'check_in_time',
        value: '14:00',
        description: 'Standard check-in time'
      },
      {
        category: 'Policies', // changed from Policy
        key: 'check_out_time',
        value: '12:00',
        description: 'Standard check-out time'
      }
    ]);

    // 8. Create Maintenance Records
    console.log('🔧 Creating maintenance records...');
    await Maintenance.insertMany([
      {
        room: rooms[0]._id, // Room 101
        reportedBy: users.find(u => u.role === 'receptionist')._id,
        assignedTo: users.find(u => u.role === 'housekeeping')._id,
        type: 'Plumbing',
        description: 'Leaking faucet in bathroom needs repair',
        priority: 'Medium',
        status: 'In Progress',
        estimatedCost: 1500,
        actualCost: 1200,
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        notes: 'Customer reported slow drainage and dripping sound'
      },
      {
        room: rooms[2]._id, // Room 201
        reportedBy: users.find(u => u.role === 'admin')._id,
        assignedTo: users.find(u => u.role === 'manager')._id,
        type: 'HVAC',
        description: 'Air conditioning not cooling properly',
        priority: 'High',
        status: 'Pending',
        estimatedCost: 3000,
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        notes: 'Guest complaint about room temperature'
      },
      {
        room: rooms[4]._id, // Room 301
        reportedBy: users.find(u => u.role === 'housekeeping')._id,
        type: 'Furniture',
        description: 'Replace damaged bedside lamp',
        priority: 'Low',
        status: 'Completed',
        estimatedCost: 800,
        actualCost: 750,
        scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        completedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
        notes: 'Lamp base was cracked, replaced with matching unit'
      }
    ]);

    // 9. Create Housekeeping Tasks
    console.log('🧹 Creating housekeeping tasks...');
    await Housekeeping.insertMany([
      {
        room: rooms[1]._id, // Room 102
        assignedTo: users.find(u => u.role === 'housekeeping')._id,
        type: 'Checkout Cleaning',
        status: 'Completed',
        priority: 'High',
        scheduledDate: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        startTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        checklist: [
          { item: 'Change bed linens', completed: true, notes: 'Fresh linens applied' },
          { item: 'Clean bathroom', completed: true, notes: 'Deep cleaned and sanitized' },
          { item: 'Vacuum carpet', completed: true },
          { item: 'Restock amenities', completed: true, notes: 'All toiletries refilled' }
        ],
        notes: 'Room ready for next guest',
        supplies: [
          { item: 'Bed sheets', quantity: 2, used: true },
          { item: 'Towels', quantity: 4, used: true },
          { item: 'Toilet paper', quantity: 2, used: true }
        ]
      },
      {
        room: rooms[3]._id, // Room 202
        assignedTo: users.find(u => u.role === 'housekeeping')._id,
        type: 'Daily Cleaning',
        status: 'In Progress',
        priority: 'Medium',
        scheduledDate: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        checklist: [
          { item: 'Make beds', completed: true },
          { item: 'Empty trash', completed: true },
          { item: 'Clean surfaces', completed: false },
          { item: 'Restock mini bar', completed: false }
        ],
        notes: 'Guest still in room, clean around them',
        supplies: [
          { item: 'Cleaning spray', quantity: 1, used: true },
          { item: 'Microfiber cloths', quantity: 3, used: true }
        ]
      },
      {
        room: rooms[5]._id, // Room 302
        assignedTo: users.find(u => u.role === 'housekeeping')._id,
        type: 'Deep Cleaning',
        status: 'Pending',
        priority: 'Medium',
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        checklist: [
          { item: 'Wash windows', completed: false },
          { item: 'Clean under furniture', completed: false },
          { item: 'Sanitize all surfaces', completed: false },
          { item: 'Steam clean carpet', completed: false }
        ],
        notes: 'Monthly deep cleaning scheduled',
        supplies: [
          { item: 'Window cleaner', quantity: 1, used: false },
          { item: 'Carpet steamer', quantity: 1, used: false },
          { item: 'Sanitizer', quantity: 2, used: false }
        ]
      }
    ]);

    // 10. Create Notifications
    console.log('🔔 Creating notifications...');
    await Notification.insertMany([
      {
        recipient: users.find(u => u.role === 'admin')._id,
        type: 'booking',
        title: 'New Booking Received',
        message: 'A new booking has been made for Room 301',
        priority: 'Medium',
        status: 'Unread',
        read: false
      },
      {
        recipient: users.find(u => u.role === 'manager')._id,
        type: 'maintenance',
        title: 'Urgent Maintenance Required',
        message: 'Room 302 requires immediate attention - plumbing issue',
        priority: 'High',
        status: 'Unread',
        read: false
      },
      {
        recipient: users.find(u => u.role === 'housekeeping')._id,
        type: 'housekeeping',
        title: 'New Housekeeping Task',
        message: 'Deep cleaning required for Room 101',
        priority: 'Medium',
        status: 'Unread',
        read: false
      },
      {
        recipient: guestUsers[0]._id,
        type: 'booking',
        title: 'Booking Confirmed',
        message: 'Your booking for Room 202 has been confirmed',
        priority: 'Low',
        status: 'Read',
        read: true
      }
    ]);

    console.log('✅ Database seeding completed successfully!');
    console.log(`
📊 Summary:
- Users: ${users.length}
- Rooms: ${rooms.length}
- Bookings: ${bookings.length}
- Service Requests: 2
- Invoices: 2
- Feedback: 3
- Maintenance Records: 3
- Housekeeping Tasks: 3
- System Settings: 10
- Notifications: 4

🔑 Login Credentials:
- Admin: admin@luxurystay.com / admin123
- Manager: manager@luxurystay.com / manager123
- Receptionist: receptionist@luxurystay.com / reception123
- Guest: john@guest.com / guest123
    `);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();
