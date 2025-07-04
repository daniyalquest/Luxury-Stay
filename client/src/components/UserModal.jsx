import React, { useState, useEffect } from "react";

const UserModal = ({ open, onClose, onSave, initialUser }) => {
  const [name, setName] = useState(initialUser?.name || "");
  const [email, setEmail] = useState(initialUser?.email || "");
  const [role, setRole] = useState(initialUser?.role || "guest");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setName(initialUser?.name || "");
    setEmail(initialUser?.email || "");
    setRole(initialUser?.role || "guest");
    setPassword("");
  }, [initialUser, open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...initialUser,
      name,
      email,
      role,
      ...(initialUser ? {} : { password }), // Only send password on create
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-lg font-bold mb-4">{initialUser ? "Edit User" : "Create User"}</h2>
        <form onSubmit={handleSubmit}>
          <input
            className="w-full mb-3 p-2 border rounded"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Name"
            required
          />
          <input
            className="w-full mb-3 p-2 border rounded"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            required
            disabled={!!initialUser}
          />
          <select
            className="w-full mb-3 p-2 border rounded"
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="receptionist">Receptionist</option>
            <option value="housekeeping">Housekeeping</option>
            <option value="guest">Guest</option>
          </select>
          {!initialUser && (
            <input
              className="w-full mb-3 p-2 border rounded"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
              required
            />
          )}
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

export default UserModal;