import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import User from '../models/User.js';
import Feedback from '../models/Feedback.js';
import Invoice from '../models/Invoice.js';
import Maintenance from '../models/Maintenance.js';
import Housekeeping from '../models/Housekeeping.js';

export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Room statistics
    const roomStats = await Room.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ status: 'Occupied' });
    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms * 100).toFixed(2) : 0;

    // Booking statistics
    const todayBookings = await Booking.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const monthlyBookings = await Booking.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    const todayCheckIns = await Booking.countDocuments({
      checkInDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['Reserved', 'CheckedIn'] }
    });

    const todayCheckOuts = await Booking.countDocuments({
      checkOutDate: { $gte: startOfDay, $lte: endOfDay },
      status: 'CheckedIn'
    });

    // Revenue statistics
    const monthlyRevenue = await Invoice.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    const yearlyRevenue = await Invoice.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Guest statistics
    const totalGuests = await User.countDocuments({ role: 'guest' });
    const newGuestsThisMonth = await User.countDocuments({
      role: 'guest',
      createdAt: { $gte: startOfMonth }
    });

    // Maintenance statistics
    const pendingMaintenance = await Maintenance.countDocuments({ status: 'Pending' });
    const criticalMaintenance = await Maintenance.countDocuments({ 
      status: { $ne: 'Completed' },
      priority: 'Critical'
    });

    // Housekeeping statistics
    const todayHousekeeping = await Housekeeping.countDocuments({
      scheduledDate: { $gte: startOfDay, $lte: endOfDay }
    });

    const completedHousekeeping = await Housekeeping.countDocuments({
      scheduledDate: { $gte: startOfDay, $lte: endOfDay },
      status: 'Completed'
    });

    // Recent feedback
    const recentFeedback = await Feedback.find()
      .populate('user', 'name')
      .populate('booking')
      .sort({ createdAt: -1 })
      .limit(5);

    const averageRating = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    res.json({
      rooms: {
        total: totalRooms,
        occupied: occupiedRooms,
        occupancyRate: parseFloat(occupancyRate),
        statusBreakdown: roomStats
      },
      bookings: {
        today: todayBookings,
        monthly: monthlyBookings,
        todayCheckIns,
        todayCheckOuts
      },
      revenue: {
        monthly: monthlyRevenue[0]?.total || 0,
        yearly: yearlyRevenue[0]?.total || 0
      },
      guests: {
        total: totalGuests,
        newThisMonth: newGuestsThisMonth
      },
      maintenance: {
        pending: pendingMaintenance,
        critical: criticalMaintenance
      },
      housekeeping: {
        todayTotal: todayHousekeeping,
        todayCompleted: completedHousekeeping,
        completionRate: todayHousekeeping > 0 ? (completedHousekeeping / todayHousekeeping * 100).toFixed(2) : 0
      },
      feedback: {
        recent: recentFeedback,
        averageRating: averageRating[0]?.avgRating || 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getOccupancyReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const occupancyData = await Booking.aggregate([
      {
        $match: {
          $or: [
            { checkInDate: { $gte: start, $lte: end } },
            { checkOutDate: { $gte: start, $lte: end } },
            { 
              checkInDate: { $lte: start },
              checkOutDate: { $gte: end }
            }
          ],
          status: { $in: ['Reserved', 'CheckedIn', 'CheckedOut'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$checkInDate' }
          },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const totalRooms = await Room.countDocuments();
    
    const occupancyReport = occupancyData.map(day => ({
      date: day._id,
      bookings: day.bookings,
      occupancyRate: totalRooms > 0 ? (day.bookings / totalRooms * 100).toFixed(2) : 0
    }));

    res.json(occupancyReport);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    let groupFormat;
    switch (groupBy) {
      case 'month':
        groupFormat = '%Y-%m';
        break;
      case 'year':
        groupFormat = '%Y';
        break;
      default:
        groupFormat = '%Y-%m-%d';
    }

    const revenueData = await Invoice.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: groupFormat, date: '$createdAt' }
          },
          totalRevenue: { $sum: '$totalAmount' },
          invoiceCount: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Revenue by room type
    const revenueByRoomType = await Invoice.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $lookup: {
          from: 'bookings',
          localField: 'booking',
          foreignField: '_id',
          as: 'booking'
        }
      },
      { $unwind: '$booking' },
      {
        $lookup: {
          from: 'rooms',
          localField: 'booking.room',
          foreignField: '_id',
          as: 'room'
        }
      },
      { $unwind: '$room' },
      {
        $group: {
          _id: '$room.type',
          totalRevenue: { $sum: '$totalAmount' },
          bookingCount: { $sum: 1 }
        }
      }
    ]);

    res.json({
      timeSeriesData: revenueData,
      roomTypeData: revenueByRoomType,
      totalRevenue: revenueData.reduce((sum, item) => sum + item.totalRevenue, 0)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getGuestReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const guestReport = await Booking.aggregate([
      {
        $match: {
          checkInDate: { $gte: start, $lte: end },
          status: { $in: ['CheckedIn', 'CheckedOut'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$checkInDate' }
          },
          totalCheckins: { $sum: 1 },
          newGuests: {
            $sum: {
              $cond: [
                { $eq: ['$isFirstTime', true] },
                1,
                0
              ]
            }
          },
          returningGuests: {
            $sum: {
              $cond: [
                { $eq: ['$isFirstTime', false] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          date: '$_id',
          totalCheckins: 1,
          newGuests: 1,
          returningGuests: 1
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.json(guestReport);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getGuestAnalytics = async (req, res) => {
  try {
    // Guest registration trends
    const guestTrends = await User.aggregate([
      {
        $match: { role: 'guest' }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$createdAt' }
          },
          newGuests: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Top guests by bookings
    const topGuests = await Booking.aggregate([
      {
        $group: {
          _id: '$guest',
          bookingCount: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'guest'
        }
      },
      { $unwind: '$guest' },
      {
        $project: {
          guestName: '$guest.name',
          guestEmail: '$guest.email',
          bookingCount: 1,
          totalSpent: 1
        }
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 10 }
    ]);

    // Booking sources
    const bookingSources = await Booking.aggregate([
      {
        $group: {
          _id: '$bookingSource',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      guestTrends,
      topGuests,
      bookingSources
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFeedbackAnalytics = async (req, res) => {
  try {
    // Rating distribution
    const ratingDistribution = await Feedback.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Average rating over time
    const ratingTrends = await Feedback.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$createdAt' }
          },
          averageRating: { $avg: '$rating' },
          feedbackCount: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Recent feedback with details
    const recentFeedback = await Feedback.find()
      .populate('user', 'name email')
      .populate({
        path: 'booking',
        populate: {
          path: 'room',
          select: 'roomNumber type'
        }
      })
      .sort({ createdAt: -1 })
      .limit(20);

    const totalFeedback = await Feedback.countDocuments();
    const averageRating = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          avg: { $avg: '$rating' }
        }
      }
    ]);

    res.json({
      ratingDistribution,
      ratingTrends,
      recentFeedback,
      totalFeedback,
      averageRating: averageRating[0]?.avg || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getOperationalReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Maintenance trends
    const maintenanceStats = await Maintenance.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgCost: { $avg: '$actualCost' }
        }
      }
    ]);

    // Housekeeping efficiency
    const housekeepingStats = await Housekeeping.aggregate([
      {
        $match: {
          scheduledDate: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Room status distribution
    const roomStatusStats = await Room.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      maintenance: maintenanceStats,
      housekeeping: housekeepingStats,
      roomStatus: roomStatusStats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
