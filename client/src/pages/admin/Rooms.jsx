import React, { useEffect, useState } from "react";
import RoomModal from "../../components/RoomModal";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/rooms")
      .then((res) => res.json())
      .then((data) => {
        setRooms(data);
        setLoading(false);
      });
  }, []);

  const handleCreate = () => {
    setEditingRoom(null);
    setModalOpen(true);
  };

  const handleEdit = (id) => {
    const room = rooms.find((r) => r._id === id);
    setEditingRoom(room);
    setModalOpen(true);
  };

  const handleSave = async (roomData) => {
    try {
      let res, data;
      if (roomData._id) {
        // Edit room
        res = await fetch(`http://localhost:5000/api/rooms/${roomData._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(roomData),
        });
        data = await res.json();
        if (res.ok) {
          setRooms(rooms.map((r) => (r._id === data._id ? data : r)));
        } else {
          alert(data.message || "Failed to update room.");
        }
      } else {
        // Create room
        res = await fetch("http://localhost:5000/api/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(roomData),
        });
        data = await res.json();
        if (res.ok) {
          setRooms([...rooms, data]);
        } else {
          alert(data.message || "Failed to create room.");
        }
      }
      setModalOpen(false);
    } catch (err) {
      alert("An error occurred while saving the room.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        const res = await fetch(`http://localhost:5000/api/rooms/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setRooms(rooms.filter((r) => r._id !== id));
        } else {
          const data = await res.json();
          alert(data.message || "Failed to delete room.");
        }
      } catch (err) {
        alert("An error occurred while deleting the room.");
      }
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Room Inventory</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleCreate}
        >
          Create Room
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Room Number</th>
              <th className="py-2 px-4 border-b">Type</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Price</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room._id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{room.roomNumber}</td>
                <td className="py-2 px-4 border-b">{room.type}</td>
                <td className="py-2 px-4 border-b">{room.status}</td>
                <td className="py-2 px-4 border-b">{room.price}</td>
                <td className="py-2 px-4 border-b space-x-2">
                  <button
                    className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500"
                    onClick={() => handleEdit(room._id)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    onClick={() => handleDelete(room._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {rooms.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  No rooms found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <RoomModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialRoom={editingRoom}
      />
    </div>
  );
};

export default Rooms;
