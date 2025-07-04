import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import UserModal from "../../components/UserModal";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [filter, setFilter] = useState("all");
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    // Fetch users from API
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Check if user is authenticated
                const token = localStorage.getItem('token');
                if (!token) {
                    setError("No authentication token found. Please log in.");
                    navigate('/login');
                    return;
                }

                // Check if user has permission to view users
                if (!currentUser || !['admin', 'manager', 'receptionist'].includes(currentUser.role)) {
                    setError("You don't have permission to view users.");
                    return;
                }
                
                const response = await axios.get("/users");
                setUsers(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error("Error fetching users:", err);
                if (err.response?.status === 401) {
                    setError("Authentication failed. Please log in again.");
                    localStorage.removeItem('token');
                    navigate('/login');
                } else {
                    setError(err.response?.data?.message || "Failed to fetch users");
                }
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [currentUser, navigate]);

    const handleCreate = () => {
        setEditingUser(null);
        setModalOpen(true);
    };

    const handleEdit = (id) => {
        const user = users.find(u => u._id === id);
        setEditingUser(user);
        setModalOpen(true);
    };

    const handleSave = async (userData) => {
        try {
            let response;
            if (userData._id) {
                // Edit user
                response = await axios.put(`/users/${userData._id}`, userData);
                if (response.data) {
                    setUsers(users.map(u => u._id === response.data._id ? response.data : u));
                }
            } else {
                // Create user
                response = await axios.post("/users/register", userData);
                if (response.data) {
                    setUsers([...users, response.data]);
                }
            }
            setModalOpen(false);
        } catch (err) {
            console.error("Error saving user:", err);
            alert(err.response?.data?.message || "An error occurred while saving the user.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await axios.delete(`/users/${id}`);
                setUsers(users.filter((u) => u._id !== id));
            } catch (error) {
                console.error("Error deleting user:", error);
                alert(error.response?.data?.message || "Failed to delete user.");
            }
        }
    };

    const filteredUsers = Array.isArray(users) ? users.filter(user => {
        if (filter === "all") return true;
        if (filter === "guest") return user.role === "guest";
        if (filter === "staff") return user.role !== "guest";
        return true;
    }) : [];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <strong>Error:</strong> {error}
                    <button 
                        onClick={() => window.location.reload()} 
                        className="ml-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">User Management</h2>
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    onClick={handleCreate}
                >
                    Create User
                </button>
            </div>
            <div className="mb-4 flex gap-2">
                <button
                    className={`px-4 py-2 rounded ${filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                    onClick={() => setFilter("all")}
                >
                    All
                </button>
                <button
                    className={`px-4 py-2 rounded ${filter === "guest" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                    onClick={() => setFilter("guest")}
                >
                    Guests
                </button>
                <button
                    className={`px-4 py-2 rounded ${filter === "staff" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                    onClick={() => setFilter("staff")}
                >
                    Staff
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">Name</th>
                            <th className="py-2 px-4 border-b">Email</th>
                            <th className="py-2 px-4 border-b">Role</th>
                            <th className="py-2 px-4 border-b">Contact</th>
                            <th className="py-2 px-4 border-b">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50">
                                <td className="py-2 px-4 border-b">{user.name}</td>
                                <td className="py-2 px-4 border-b">{user.email}</td>
                                <td className="py-2 px-4 border-b">{user.role}</td>
                                <td className="py-2 px-4 border-b">{user.phone || "-"}</td>
                                <td className="py-2 px-4 border-b space-x-2">
                                    <button
                                        className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500"
                                        onClick={() => handleEdit(user._id)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                        onClick={() => handleDelete(user._id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-4 text-gray-500">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <UserModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                initialUser={editingUser}
            />
        </div>
    );
};

export default Users;