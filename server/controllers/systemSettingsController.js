import SystemSettings from '../models/SystemSettings.js';

export const createSetting = async (req, res) => {
  try {
    const setting = await SystemSettings.create({
      ...req.body,
      lastModifiedBy: req.user._id
    });
    res.status(201).json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllSettings = async (req, res) => {
  try {
    const { category, isActive } = req.query;
    const filter = {};
    
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const settings = await SystemSettings.find(filter)
      .populate('lastModifiedBy', 'name email')
      .sort({ category: 1, key: 1 });

    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSettingByKey = async (req, res) => {
  try {
    const setting = await SystemSettings.findOne({ key: req.params.key })
      .populate('lastModifiedBy', 'name email');
      
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    res.json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateSetting = async (req, res) => {
  try {
    const setting = await SystemSettings.findOneAndUpdate(
      { key: req.params.key },
      { 
        ...req.body, 
        lastModifiedBy: req.user._id 
      },
      { new: true, runValidators: true }
    ).populate('lastModifiedBy', 'name email');

    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    res.json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteSetting = async (req, res) => {
  try {
    const setting = await SystemSettings.findOneAndDelete({ key: req.params.key });
    
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    res.json({ message: 'Setting deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSettingsByCategory = async (req, res) => {
  try {
    const settings = await SystemSettings.find({ 
      category: req.params.category,
      isActive: true 
    }).sort({ key: 1 });

    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Bulk update settings
export const bulkUpdateSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    const updatePromises = settings.map(setting => 
      SystemSettings.findOneAndUpdate(
        { key: setting.key },
        { 
          value: setting.value, 
          lastModifiedBy: req.user._id 
        },
        { new: true }
      )
    );

    const updatedSettings = await Promise.all(updatePromises);
    res.json(updatedSettings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
