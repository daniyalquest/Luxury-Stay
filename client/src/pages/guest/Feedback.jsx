import { useState, useEffect } from 'react';
import axios from '../../api/axios';

const GuestFeedback = () => {
  const [bookings, setBookings] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [formData, setFormData] = useState({
    rating: 5,
    category: 'service',
    comment: '',
    suggestions: []
  });

  const categories = [
    { value: 'service', label: 'Service' },
    { value: 'room', label: 'Room' },
    { value: 'food', label: 'Food & Dining' },
    { value: 'staff', label: 'Staff' },
    { value: 'facility', label: 'Facilities' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, feedbacksRes] = await Promise.all([
        axios.get('/bookings/my'),
        axios.get('/feedback/my-feedback')
      ]);
      setBookings(bookingsRes.data);
      setFeedbacks(feedbacksRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/feedback', {
        ...formData,
        booking: selectedBooking._id,
        suggestions: formData.suggestions.filter(s => s.trim() !== '')
      });
      fetchData();
      setShowFeedbackModal(false);
      setSelectedBooking(null);
      setFormData({
        rating: 5,
        category: 'service',
        comment: '',
        suggestions: []
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleSuggestionChange = (index, value) => {
    const newSuggestions = [...formData.suggestions];
    newSuggestions[index] = value;
    setFormData(prev => ({
      ...prev,
      suggestions: newSuggestions
    }));
  };

  const addSuggestion = () => {
    setFormData(prev => ({
      ...prev,
      suggestions: [...prev.suggestions, '']
    }));
  };

  const removeSuggestion = (index) => {
    setFormData(prev => ({
      ...prev,
      suggestions: prev.suggestions.filter((_, i) => i !== index)
    }));
  };

  const renderStars = (rating, editable = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-2xl cursor-pointer ${
          i < rating ? 'text-yellow-400' : 'text-gray-300'
        } ${editable ? 'hover:text-yellow-400' : ''}`}
        onClick={editable ? () => setFormData(prev => ({ ...prev, rating: i + 1 })) : undefined}
      >
        ★
      </span>
    ));
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      responded: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryColor = (category) => {
    const colors = {
      service: 'bg-blue-100 text-blue-800',
      room: 'bg-green-100 text-green-800',
      food: 'bg-orange-100 text-orange-800',
      staff: 'bg-purple-100 text-purple-800',
      facility: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getBookingFeedback = (bookingId) => {
    return feedbacks.find(f => f.booking?._id === bookingId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Feedback</h1>
        <p className="text-gray-600 mt-2">Share your experience and help us improve</p>
      </div>

      {/* Bookings Available for Feedback */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Completed Stays</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings
            .filter(booking => booking.status === 'CheckedOut')
            .map(booking => {
              const existingFeedback = getBookingFeedback(booking._id);
              return (
                <div key={booking._id} className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Room {booking.room?.number}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(booking.checkInDate).toLocaleDateString()} - {' '}
                        {new Date(booking.checkOutDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-blue-600">
                      ${booking.totalAmount}
                    </span>
                  </div>
                  
                  {existingFeedback ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {renderStars(existingFeedback.rating)}
                        <span className="text-sm text-gray-600">
                          {existingFeedback.rating}/5
                        </span>
                      </div>
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(existingFeedback.status)}`}>
                        {existingFeedback.status}
                      </span>
                      <p className="text-sm text-gray-600 mt-2">
                        Feedback submitted on {new Date(existingFeedback.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowFeedbackModal(true);
                      }}
                      className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 mt-2"
                    >
                      Leave Feedback
                    </button>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Previous Feedback */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Feedback History</h2>
        <div className="space-y-4">
          {feedbacks.map(feedback => (
            <div key={feedback._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      Room {feedback.booking?.room?.number || 'N/A'}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(feedback.category)}`}>
                      {feedback.category}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(feedback.status)}`}>
                      {feedback.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    {renderStars(feedback.rating)}
                    <span className="text-sm text-gray-600">
                      {feedback.rating}/5
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Submitted on {new Date(feedback.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Your Feedback:</h4>
                <p className="text-gray-700">{feedback.comment}</p>
              </div>

              {feedback.suggestions && feedback.suggestions.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Suggestions:</h4>
                  <ul className="list-disc list-inside text-gray-700">
                    {feedback.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

              {feedback.response && (
                <div className="bg-blue-50 p-4 rounded-md">
                  <h4 className="font-medium text-gray-900 mb-2">Hotel Response:</h4>
                  <p className="text-gray-700">{feedback.response}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Responded on {new Date(feedback.respondedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {feedbacks.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No feedback submitted yet.</p>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Feedback for Room {selectedBooking.room?.number}
            </h3>
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                Stay: {new Date(selectedBooking.checkInDate).toLocaleDateString()} - {' '}
                {new Date(selectedBooking.checkOutDate).toLocaleDateString()}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overall Rating
                </label>
                <div className="flex items-center space-x-2">
                  {renderStars(formData.rating, true)}
                  <span className="text-sm text-gray-600">
                    {formData.rating}/5
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Feedback
                </label>
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about your experience..."
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Suggestions (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={addSuggestion}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    + Add Suggestion
                  </button>
                </div>
                {formData.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={suggestion}
                      onChange={(e) => handleSuggestionChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter a suggestion..."
                    />
                    <button
                      type="button"
                      onClick={() => removeSuggestion(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setSelectedBooking(null);
                    setFormData({
                      rating: 5,
                      category: 'service',
                      comment: '',
                      suggestions: []
                    });
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestFeedback;
