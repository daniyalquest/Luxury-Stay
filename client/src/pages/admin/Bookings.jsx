import React, { useEffect, useState } from "react";
import BookingModal from "../../components/BookingModal";
import axios from "../../api/axios";

const statusOptions = ["Reserved", "CheckedIn", "CheckedOut", "Cancelled"];

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [bookingsRes, usersRes, roomsRes] = await Promise.all([
          axios.get("/bookings"),
          axios.get("/users"),
          axios.get("/rooms"),
        ]);
        setBookings(bookingsRes.data.bookings);
        setGuests(usersRes.data.filter((u) => u.role === "guest"));
        setRooms(roomsRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch initial data", error);
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/bookings");
      setBookings(res.data.bookings);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch bookings", error);
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await axios.patch(`/bookings/${id}/status`, { status });
      setBookings(
        bookings.map((b) =>
          b._id === id ? { ...b, status: res.data.status } : b
        )
      );
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update status.");
    }
  };

  const handleCreate = () => setModalOpen(true);

  const handleSave = async (bookingData) => {
    try {
      const res = await axios.post("/bookings", bookingData);
      setBookings([...bookings, res.data]);
      setModalOpen(false);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create booking.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        await axios.delete(`/bookings/${id}`);
        fetchBookings(); // Refresh the list
      } catch (error) {
        alert(error.response?.data?.message || "Failed to delete booking.");
      }
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Booking Records</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleCreate}
        >
          Create Booking
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Guest</th>
              <th className="py-2 px-4 border-b">Room</th>
              <th className="py-2 px-4 border-b">Check-In</th>
              <th className="py-2 px-4 border-b">Check-Out</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{b.guest?.name || "-"}</td>
                <td className="py-2 px-4 border-b">{b.room?.roomNumber || "-"}</td>
                <td className="py-2 px-4 border-b">
                  {new Date(b.checkInDate).toLocaleDateString()}
                </td>
                <td className="py-2 px-4 border-b">
                  {new Date(b.checkOutDate).toLocaleDateString()}
                </td>
                <td className="py-2 px-4 border-b">{b.status}</td>
                <td className="py-2 px-4 border-b space-x-2">
                  <select
                    value={b.status}
                    onChange={e => handleStatusChange(b._id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    {statusOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 ml-2"
                    onClick={() => handleDelete(b._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <BookingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        guests={guests}
        rooms={rooms}
      />
    </div>
  );
};

export default Bookings;
