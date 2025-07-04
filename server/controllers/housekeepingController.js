import Housekeeping from '../models/Housekeeping.js';
import Room from '../models/Room.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

export const createHousekeepingTask = async (req, res) => {
  try {
    const housekeeping = await Housekeeping.create(req.body);
    
    // Update room status to cleaning
    await Room.findByIdAndUpdate(req.body.room, { status: 'Cleaning' });

    // Create notification for assigned staff
    await Notification.create({
      recipient: req.body.assignedTo,
      title: 'New Housekeeping Task',
      message: `You have been assigned a ${req.body.type} task`,
      type: 'housekeeping',
      priority: req.body.priority,
      relatedEntity: {
        entityType: 'housekeeping',
        entityId: housekeeping._id
      },
      actionRequired: true
    });

    const populatedTask = await Housekeeping.findById(housekeeping._id)
      .populate('room', 'roomNumber type floor')
      .populate('assignedTo', 'name email');

    res.status(201).json(populatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllHousekeepingTasks = async (req, res) => {
  try {
    const { status, assignedTo, room, date } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (room) filter.room = room;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.scheduledDate = { $gte: startDate, $lt: endDate };
    }

    // If user is housekeeping staff, only show their tasks
    if (req.user.role === 'housekeeping') {
      filter.assignedTo = req.user._id;
    }

    const tasks = await Housekeeping.find(filter)
      .populate('room', 'roomNumber type floor')
      .populate('assignedTo', 'name email')
      .sort({ scheduledDate: 1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getHousekeepingById = async (req, res) => {
  try {
    const task = await Housekeeping.findById(req.params.id)
      .populate('room', 'roomNumber type floor description')
      .populate('assignedTo', 'name email phone');

    if (!task) {
      return res.status(404).json({ message: 'Housekeeping task not found' });
    }

    // Check ownership for housekeeping staff
    if (req.user.role === 'housekeeping' && task.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateHousekeepingTask = async (req, res) => {
  try {
    const task = await Housekeeping.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('room', 'roomNumber type')
     .populate('assignedTo', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Housekeeping task not found' });
    }

    // Update room status based on task completion
    if (req.body.status === 'Completed') {
      await Room.findByIdAndUpdate(task.room._id, { 
        status: 'Available',
        lastCleaned: new Date()
      });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const markTaskCompleted = async (req, res) => {
  try {
    const { checklist, notes, issuesFound } = req.body;
    
    const task = await Housekeeping.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Completed',
        endTime: new Date(),
        checklist,
        notes,
        issuesFound
      },
      { new: true }
    ).populate('room assignedTo');

    if (!task) {
      return res.status(404).json({ message: 'Housekeeping task not found' });
    }

    // Update room status
    await Room.findByIdAndUpdate(task.room._id, { 
      status: 'Available',
      lastCleaned: new Date()
    });

    // If issues were found, create maintenance requests
    if (issuesFound && issuesFound.length > 0) {
      const maintenancePromises = issuesFound.map(issue => 
        Maintenance.create({
          room: task.room._id,
          reportedBy: task.assignedTo._id,
          type: 'Other',
          description: issue,
          priority: 'Medium'
        })
      );
      await Promise.all(maintenancePromises);
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getHousekeepingSchedule = async (req, res) => {
  try {
    const { date, staffId } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const startDate = new Date(targetDate.setHours(0, 0, 0, 0));
    const endDate = new Date(targetDate.setHours(23, 59, 59, 999));

    const filter = {
      scheduledDate: { $gte: startDate, $lte: endDate }
    };

    if (staffId) filter.assignedTo = staffId;
    if (req.user.role === 'housekeeping') filter.assignedTo = req.user._id;

    const schedule = await Housekeeping.find(filter)
      .populate('room', 'roomNumber type floor')
      .populate('assignedTo', 'name')
      .sort({ scheduledDate: 1 });

    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getHousekeepingStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const todayStats = await Housekeeping.aggregate([
      {
        $match: {
          scheduledDate: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const staffPerformance = await Housekeeping.aggregate([
      {
        $match: {
          scheduledDate: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      {
        $group: {
          _id: '$assignedTo',
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'staff'
        }
      }
    ]);

    res.json({ todayStats, staffPerformance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
