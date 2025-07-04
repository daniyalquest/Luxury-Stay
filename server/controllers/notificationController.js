import Notification from '../models/Notification.js';

export const createNotification = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    const populatedNotification = await Notification.findById(notification._id)
      .populate('recipient', 'name email');
    
    res.status(201).json(populatedNotification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserNotifications = async (req, res) => {
  try {
    const { status, type, limit = 50 } = req.query;
    const filter = { recipient: req.user._id };

    if (status) filter.status = status;
    if (type) filter.type = type;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { 
        _id: req.params.id, 
        recipient: req.user._id 
      },
      { 
        status: 'Read',
        readAt: new Date()
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { 
        recipient: req.user._id,
        status: 'Unread'
      },
      { 
        status: 'Read',
        readAt: new Date()
      }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getNotificationStats = async (req, res) => {
  try {
    const stats = await Notification.aggregate([
      { $match: { recipient: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const typeStats = await Notification.aggregate([
      { $match: { recipient: req.user._id } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({ statusStats: stats, typeStats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Broadcast notification to multiple users
export const broadcastNotification = async (req, res) => {
  try {
    const { recipients, title, message, type, priority } = req.body;
    
    const notifications = recipients.map(recipientId => ({
      recipient: recipientId,
      title,
      message,
      type,
      priority
    }));

    const createdNotifications = await Notification.insertMany(notifications);
    res.status(201).json(createdNotifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
