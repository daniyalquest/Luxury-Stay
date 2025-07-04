import React, { useState, useEffect } from "react";

const BookingModal = ({ open, onClose, onSave, guests, rooms, initialBooking }) => {
  const [guest, setGuest] = useState("");
  const [room, setRoom] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (initialBooking) {
      setGuest(initialBooking.guest?._id || "");
      setRoom(initialBooking.room?._id || "");
      setCheckInDate(initialBooking.checkInDate ? initialBooking.checkInDate.slice(0, 10) : "");
      setCheckOutDate(initialBooking.checkOutDate ? initialBooking.checkOutDate.slice(0, 10) : "");
    } else {
      setGuest("");
      setRoom("");
      setCheckInDate("");
      setCheckOutDate("");
    }
  }, [open, initialBooking]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ guest, room, checkInDate, checkOutDate });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-lg font-bold mb-4">{initialBooking ? "Edit Booking" : "Create Booking"}</h2>
        <form onSubmit={handleSubmit}>
          {guests && guests.length > 0 && (
            <div className="mb-3">
              <label className="block mb-1 font-semibold">Guest</label>
              <select
                className="w-full p-2 border rounded"
                value={guest}
                onChange={e => setGuest(e.target.value)}
                required
                disabled={!!initialBooking} // prevent changing guest on edit
              >
                <option value="">Select Guest</option>
                {guests.map(g => (
                  <option key={g._id} value={g._id}>{g.name} ({g.email})</option>
                ))}
              </select>
            </div>
          )}
          <div className="mb-3">
            <label className="block mb-1 font-semibold">Room</label>
            <select
              className="w-full p-2 border rounded"
              value={room}
              onChange={e => setRoom(e.target.value)}
              required
            >
              <option value="">Select Room</option>
              {rooms
                .filter(r => r.status === "Available" || r._id === room) // allow editing current room
                .map(r => (
                  <option key={r._id} value={r._id}>
                    {r.roomNumber} - {r.type} (Rs. {r.price})
                  </option>
                ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="block mb-1 font-semibold">Start Date</label>
            <input
              className="w-full p-2 border rounded"
              type="date"
              value={checkInDate}
              onChange={e => setCheckInDate(e.target.value)}
              min={today}
              required
            />
          </div>
          <div className="mb-3">
            <label className="block mb-1 font-semibold">End Date</label>
            <input
              className="w-full p-2 border rounded"
              type="date"
              value={checkOutDate}
              onChange={e => setCheckOutDate(e.target.value)}
              min={checkInDate || today}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="bg-gray-300 px-4 py-2 rounded"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;