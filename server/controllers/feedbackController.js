import Feedback from '../models/Feedback.js';

export const createFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.create({
      ...req.body,
      user: req.user._id
    });
    
    const populatedFeedback = await Feedback.findById(feedback._id)
      .populate('user', 'name email')
      .populate({
        path: 'booking',
        populate: {
          path: 'room',
          select: 'number type'
        }
      });
    
    res.status(201).json(populatedFeedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('user', 'name email')
      .populate({
        path: 'booking',
        populate: {
          path: 'room',
          select: 'number type'
        }
      })
      .populate('respondedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMyFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ user: req.user._id })
      .populate({
        path: 'booking',
        populate: {
          path: 'room',
          select: 'number type'
        }
      })
      .populate('respondedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('user', 'name email')
      .populate({
        path: 'booking',
        populate: {
          path: 'room',
          select: 'number type'
        }
      })
      .populate('respondedBy', 'name email');
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateFeedbackStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('user', 'name email')
     .populate({
       path: 'booking',
       populate: {
         path: 'room',
         select: 'number type'
       }
     })
     .populate('respondedBy', 'name email');
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const respondToFeedback = async (req, res) => {
  try {
    const { response } = req.body;
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { 
        response,
        respondedBy: req.user._id,
        respondedAt: new Date(),
        status: 'responded'
      },
      { new: true, runValidators: true }
    ).populate('user', 'name email')
     .populate({
       path: 'booking',
       populate: {
         path: 'room',
         select: 'number type'
       }
     })
     .populate('respondedBy', 'name email');
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    res.json({ message: 'Feedback deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
