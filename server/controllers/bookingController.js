import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import SystemSettings from '../models/SystemSettings.js';

// Helper function to calculate booking amount
const calculateBookingAmount = async (room, checkInDate, checkOutDate) => {
  const nights = Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24));
  const baseAmount = nights * room.price;
  
  // Get tax rate from system settings
  const taxSetting = await SystemSettings.findOne({ key: 'tax_rate' });
  const taxRate = taxSetting ? taxSetting.value : 0.1; // Default 10%
  
  const taxAmount = baseAmount * taxRate;
  const totalAmount = baseAmount + taxAmount;
  
  return { baseAmount, taxAmount, totalAmount, nights };
};

export const createBooking = async (req, res) => {
  try {
    const { guest, room, checkInDate, checkOutDate, numberOfGuests, specialRequests, bookingSource } = req.body;
    
    // Check room availability
    const roomDoc = await Room.findById(room);
    if (!roomDoc) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    if (roomDoc.status !== 'Available') {
      return res.status(400).json({ message: 'Room is not available' });
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      room,
      status: { $in: ['Reserved', 'CheckedIn'] },
      $or: [
        {
          checkInDate: { $lte: new Date(checkInDate) },
          checkOutDate: { $gt: new Date(checkInDate) }
        },
        {
          checkInDate: { $lt: new Date(checkOutDate) },
          checkOutDate: { $gte: new Date(checkOutDate) }
        },
        {
          checkInDate: { $gte: new Date(checkInDate) },
          checkOutDate: { $lte: new Date(checkOutDate) }
        }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({ message: 'Room is already booked for the selected dates' });
    }

    // Calculate amounts
    const { baseAmount, taxAmount, totalAmount } = await calculateBookingAmount(roomDoc, checkInDate, checkOutDate);

    const booking = await Booking.create({
      guest,
      room,
      checkInDate,
      checkOutDate,
      numberOfGuests: numberOfGuests || { adults: 1, children: 0 },
      specialRequests,
      bookingSource: bookingSource || 'Walk-in',
      totalAmount,
      taxAmount,
      status: "Reserved"
    });

    // Update the room status to "Occupied"
    await Room.findByIdAndUpdate(room, { status: "Occupied" });

    // Create notification for guest
    await Notification.create({
      recipient: guest,
      title: 'Booking Confirmation',
      message: `Your booking for room ${roomDoc.roomNumber} has been confirmed`,
      type: 'booking',
      relatedEntity: {
        entityType: 'booking',
        entityId: booking._id
      }
    });

    // Populate and return booking
    const populatedBooking = await Booking.findById(booking._id)
      .populate('guest', 'name email phone')
      .populate('room', 'roomNumber type price');

    res.status(201).json(populatedBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const { status, guest, room, checkInDate, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (guest) filter.guest = guest;
    if (room) filter.room = room;
    if (checkInDate) {
      const date = new Date(checkInDate);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      filter.checkInDate = { $gte: date, $lt: nextDate };
    }

    const skip = (page - 1) * limit;
    
    const bookings = await Booking.find(filter)
      .populate('guest', 'name email phone')
      .populate('room', 'roomNumber type price floor')
      .populate('checkedInBy', 'name')
      .populate('checkedOutBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    res.json({
      bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('guest', 'name email phone address')
      .populate('room', 'roomNumber type price floor amenities')
      .populate('services')
      .populate('checkedInBy', 'name')
      .populate('checkedOutBy', 'name');
      
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    // Check authorization for guests
    if (req.user.role === 'guest' && booking.guest._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const updateData = req.body;

    // First, get the booking to check ownership
    const existingBooking = await Booking.findById(bookingId).populate('room');
    if (!existingBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization for guests
    if (req.user.role === 'guest' && existingBooking.guest.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // If dates are being changed, recalculate amounts
    if (updateData.checkInDate || updateData.checkOutDate) {

      const checkInDate = updateData.checkInDate || existingBooking.checkInDate;
      const checkOutDate = updateData.checkOutDate || existingBooking.checkOutDate;
      
      const { totalAmount, taxAmount } = await calculateBookingAmount(existingBooking.room, checkInDate, checkOutDate);
      updateData.totalAmount = totalAmount;
      updateData.taxAmount = taxAmount;
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      updateData,
      { new: true, runValidators: true }
    ).populate('guest', 'name email phone')
     .populate('room', 'roomNumber type price');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const checkInGuest = async (req, res) => {
  try {
    const { keyNumber } = req.body;
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status: 'CheckedIn',
        actualCheckInDate: new Date(),
        checkedInBy: req.user._id,
        keyNumber
      },
      { new: true }
    ).populate('guest room');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update room status
    await Room.findByIdAndUpdate(booking.room._id, { status: 'Occupied' });

    // Create notification
    await Notification.create({
      recipient: booking.guest._id,
      title: 'Check-in Successful',
      message: `You have successfully checked into room ${booking.room.roomNumber}`,
      type: 'booking'
    });

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const checkOutGuest = async (req, res) => {
  try {
    const { finalAmount, paymentMethod } = req.body;
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status: 'CheckedOut',
        actualCheckOutDate: new Date(),
        checkedOutBy: req.user._id,
        paidAmount: finalAmount || booking.totalAmount,
        paymentMethod: paymentMethod || 'Cash',
        paymentStatus: 'Paid'
      },
      { new: true }
    ).populate('guest room');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update room status to cleaning
    await Room.findByIdAndUpdate(booking.room._id, { status: 'Cleaning' });

    // Create housekeeping task
    await Housekeeping.create({
      room: booking.room._id,
      assignedTo: null, // Will be assigned by housekeeping manager
      type: 'Checkout Cleaning',
      scheduledDate: new Date(),
      priority: 'High'
    });

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const updateData = { status };
    
    if (status === 'Cancelled' && reason) {
      updateData.cancellationReason = reason;
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    ).populate('guest room');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Update room status based on booking status
    if (status === 'Cancelled') {
      await Room.findByIdAndUpdate(booking.room._id, { status: 'Available' });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    // First, get the booking to find the associated room and check ownership
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Check authorization for guests
    if (req.user.role === 'guest' && booking.guest.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete the booking
    await Booking.findByIdAndDelete(req.params.id);

    // Update the room status to "Available"
    if (booking.room) {
      await Room.findByIdAndUpdate(booking.room, { status: "Available" });
    }

    res.json({ message: 'Booking deleted successfully and room status updated to Available' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get bookings for a specific date range
export const getBookingsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const bookings = await Booking.find({
      $or: [
        {
          checkInDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
        },
        {
          checkOutDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
        },
        {
          checkInDate: { $lte: new Date(startDate) },
          checkOutDate: { $gte: new Date(endDate) }
        }
      ]
    })
    .populate('guest', 'name email')
    .populate('room', 'roomNumber type')
    .sort({ checkInDate: 1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get available rooms for specific dates
export const getAvailableRooms = async (req, res) => {
  try {
    const { checkInDate, checkOutDate, roomType } = req.query;
    
    // Find rooms that don't have conflicting bookings
    const bookedRoomIds = await Booking.distinct('room', {
      status: { $in: ['Reserved', 'CheckedIn'] },
      $or: [
        {
          checkInDate: { $lte: new Date(checkInDate) },
          checkOutDate: { $gt: new Date(checkInDate) }
        },
        {
          checkInDate: { $lt: new Date(checkOutDate) },
          checkOutDate: { $gte: new Date(checkOutDate) }
        },
        {
          checkInDate: { $gte: new Date(checkInDate) },
          checkOutDate: { $lte: new Date(checkOutDate) }
        }
      ]
    });

    const filter = {
      _id: { $nin: bookedRoomIds },
      status: 'Available',
      isActive: true
    };

    if (roomType) filter.type = roomType;

    const availableRooms = await Room.find(filter).sort({ roomNumber: 1 });
    
    res.json(availableRooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get my bookings (for guests)
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ guest: req.user._id })
      .populate('room', 'number type price')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
