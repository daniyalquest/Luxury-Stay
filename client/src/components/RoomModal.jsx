import React, { useState, useEffect } from "react";

const RoomModal = ({ open, onClose, onSave, initialRoom }) => {
  const [roomNumber, setRoomNumber] = useState(initialRoom?.roomNumber || "");
  const [type, setType] = useState(initialRoom?.type || "");
  const [status, setStatus] = useState(initialRoom?.status || "Available");
  const [price, setPrice] = useState(initialRoom?.price || "");
  const [description, setDescription] = useState(initialRoom?.description || "");

  useEffect(() => {
    setRoomNumber(initialRoom?.roomNumber || "");
    setType(initialRoom?.type || "");
    setStatus(initialRoom?.status || "Available");
    setPrice(initialRoom?.price || "");
    setDescription(initialRoom?.description || "");
  }, [initialRoom]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...initialRoom,
      roomNumber,
      type,
      status,
      price: Number(price),
      description,
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-lg font-bold mb-4">{initialRoom ? "Edit Room" : "Create Room"}</h2>
        <form onSubmit={handleSubmit}>
          <input
            className="w-full mb-3 p-2 border rounded"
            value={roomNumber}
            onChange={e => setRoomNumber(e.target.value)}
            placeholder="Room Number"
            required
            disabled={!!initialRoom}
          />
          <input
            className="w-full mb-3 p-2 border rounded"
            value={type}
            onChange={e => setType(e.target.value)}
            placeholder="Type"
            required
          />
          <select
            className="w-full mb-3 p-2 border rounded"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Maintenance">Maintenance</option>
          </select>
          <input
            className="w-full mb-3 p-2 border rounded"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="Price"
            type="number"
            required
          />
          <textarea
            className="w-full mb-3 p-2 border rounded"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description"
          />
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

export default RoomModal;