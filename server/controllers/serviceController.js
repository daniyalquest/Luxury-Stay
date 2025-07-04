import ServiceRequest from '../models/ServiceRequest.js';

export const createServiceRequest = async (req, res) => {
  try {
    const service = await ServiceRequest.create(req.body);
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getServiceRequestsByBooking = async (req, res) => {
  const services = await ServiceRequest.find({ booking: req.params.bookingId });
  res.json(services);
};

export const updateServiceStatus = async (req, res) => {
  const service = await ServiceRequest.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(service);
};
