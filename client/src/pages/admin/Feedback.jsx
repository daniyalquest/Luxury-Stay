import { useState, useEffect } from 'react';
import axios from '../../api/axios';

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [response, setResponse] = useState('');

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await axios.get('/feedback');
      setFeedbacks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setLoading(false);
    }
  };

  const handleResponseSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/feedback/${selectedFeedback._id}/response`, {
        response
      });
      fetchFeedbacks();
      setShowResponseModal(false);
      setSelectedFeedback(null);
      setResponse('');
    } catch (error) {
      console.error('Error submitting response:', error);
    }
  };

  const handleStatusUpdate = async (feedbackId, status) => {
    try {
      await axios.patch(`/feedback/${feedbackId}/status`, { status });
      fetchFeedbacks();
    } catch (error) {
      console.error('Error updating feedback status:', error);
    }
  };

  const handleDelete = async (feedbackId) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        await axios.delete(`/feedback/${feedbackId}`);
        fetchFeedbacks();
      } catch (error) {
        console.error('Error deleting feedback:', error);
      }
    }
  };

  const filteredAndSortedFeedbacks = feedbacks
    .filter(feedback => {
      if (filter === 'all') return true;
      if (filter === 'pending') return feedback.status === 'pending';
      if (filter === 'responded') return feedback.status === 'responded';
      if (filter === 'resolved') return feedback.status === 'resolved';
      return feedback.category === filter;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'rating-high') return b.rating - a.rating;
      if (sortBy === 'rating-low') return a.rating - b.rating;
      return 0;
    });

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

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </span>
    ));
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
        <h1 className="text-3xl font-bold text-gray-800">Feedback Management</h1>
        <p className="text-gray-600 mt-2">Manage and respond to guest feedback</p>
      </div>

      {/* Filters and Sorting */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
        <div className="flex space-x-4">
          {['all', 'pending', 'responded', 'resolved', 'service', 'room', 'food', 'staff', 'facility', 'other'].map(filterType => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-md font-medium capitalize ${
                filter === filterType
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {filterType}
            </button>
          ))}
        </div>
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rating-high">Highest Rating</option>
            <option value="rating-low">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-6">
        {filteredAndSortedFeedbacks.map((feedback) => (
          <div key={feedback._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {feedback.user?.name || 'Anonymous'}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(feedback.category)}`}>
                    {feedback.category}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(feedback.status)}`}>
                    {feedback.status}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex">{renderStars(feedback.rating)}</div>
                  <span className="text-sm text-gray-500">
                    {feedback.rating}/5
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {feedback.booking?.room?.number ? `Room ${feedback.booking.room.number}` : 'No room specified'} •
                  {new Date(feedback.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <select
                  value={feedback.status}
                  onChange={(e) => handleStatusUpdate(feedback._id, e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="responded">Responded</option>
                  <option value="resolved">Resolved</option>
                </select>
                <button
                  onClick={() => {
                    setSelectedFeedback(feedback);
                    setResponse(feedback.response || '');
                    setShowResponseModal(true);
                  }}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                >
                  Respond
                </button>
                <button
                  onClick={() => handleDelete(feedback._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Feedback:</h4>
              <p className="text-gray-700">{feedback.comment}</p>
            </div>

            {feedback.response && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-900 mb-2">Response:</h4>
                <p className="text-gray-700">{feedback.response}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Responded by {feedback.respondedBy?.name || 'System'} on{' '}
                  {new Date(feedback.respondedAt).toLocaleDateString()}
                </p>
              </div>
            )}

            {feedback.suggestions && feedback.suggestions.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Suggestions:</h4>
                <ul className="list-disc list-inside text-gray-700">
                  {feedback.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredAndSortedFeedbacks.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No feedback found matching your criteria.</p>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Respond to {selectedFeedback.user?.name || 'Anonymous'}
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Original Feedback:</p>
              <p className="text-gray-800 bg-gray-50 p-3 rounded-md">
                {selectedFeedback.comment}
              </p>
            </div>
            <form onSubmit={handleResponseSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Response
                </label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your response to this feedback..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowResponseModal(false);
                    setSelectedFeedback(null);
                    setResponse('');
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Send Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;
