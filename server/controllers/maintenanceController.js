import Maintenance from '../models/Maintenance.js';
import Room from '../models/Room.js';
import Notification from '../models/Notification.js';

export const createMaintenanceRequest = async (req, res) => {
  try {
    const maintenanceData = {
      ...req.body,
      reportedBy: req.user._id
    };

    const maintenance = await Maintenance.create(maintenanceData);
    
    // Update room status if it's a critical issue
    if (req.body.priority === 'Critical') {
      await Room.findByIdAndUpdate(req.body.room, { status: 'Maintenance' });
    }

    // Create notification for maintenance staff
    await Notification.create({
      recipient: req.body.assignedTo || null,
      title: 'New Maintenance Request',
      message: `A ${req.body.priority.toLowerCase()} priority maintenance request has been created for ${req.body.type}`,
      type: 'maintenance',
      priority: req.body.priority,
      relatedEntity: {
        entityType: 'maintenance',
        entityId: maintenance._id
      },
      actionRequired: true
    });

    const populatedMaintenance = await Maintenance.findById(maintenance._id)
      .populate('room', 'roomNumber type')
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email');

    res.status(201).json(populatedMaintenance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllMaintenanceRequests = async (req, res) => {
  try {
    const { status, priority, room, assignedTo } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (room) filter.room = room;
    if (assignedTo) filter.assignedTo = assignedTo;

    const maintenance = await Maintenance.find(filter)
      .populate('room', 'roomNumber type floor')
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json(maintenance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMaintenanceById = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id)
      .populate('room', 'roomNumber type floor description')
      .populate('reportedBy', 'name email phone')
      .populate('assignedTo', 'name email phone');

    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    res.json(maintenance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateMaintenanceRequest = async (req, res) => {
  try {
    const maintenance = await Maintenance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('room', 'roomNumber type')
     .populate('reportedBy', 'name email')
     .populate('assignedTo', 'name email');

    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    // Update room status based on maintenance status
    if (req.body.status === 'Completed') {
      await Room.findByIdAndUpdate(maintenance.room._id, { 
        status: 'Available',
        lastMaintenance: new Date()
      });
      
      // Create completion notification
      await Notification.create({
        recipient: maintenance.reportedBy._id,
        title: 'Maintenance Completed',
        message: `Maintenance request for ${maintenance.room.roomNumber} has been completed`,
        type: 'maintenance',
        relatedEntity: {
          entityType: 'maintenance',
          entityId: maintenance._id
        }
      });
    }

    res.json(maintenance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteMaintenanceRequest = async (req, res) => {
  try {
    const maintenance = await Maintenance.findByIdAndDelete(req.params.id);
    
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    res.json({ message: 'Maintenance request deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMaintenanceStats = async (req, res) => {
  try {
    const stats = await Maintenance.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgCost: { $avg: '$actualCost' }
        }
      }
    ]);

    const priorityStats = await Maintenance.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({ statusStats: stats, priorityStats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
