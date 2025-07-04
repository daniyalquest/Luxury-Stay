import React, { useEffect, useState } from "react";
import axios from "../../api/axios";

const GuestProfile = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const payload = JSON.parse(atob(token.split(".")[1]));
        const userId = payload.id;

        axios
            .get(`/users/${userId}`)
            .then((res) => setUser(res.data))
            .catch(() => setUser(null));
    }, []);

    if (!user) return <div>Loading...</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">My Profile</h2>
            <div className="bg-white p-4 rounded shadow-md max-w-md">
                <p>
                    <strong>Name:</strong> {user.name}
                </p>
                <p>
                    <strong>Email:</strong> {user.email}
                </p>
                <p>
                    <strong>Role:</strong> {user.role}
                </p>
                <p>
                    <strong>Phone:</strong> {user.phone || "-"}
                </p>
            </div>
        </div>
    );
};

export default GuestProfile;