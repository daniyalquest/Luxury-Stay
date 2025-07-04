import React, { useEffect, useState } from "react";
import BookingModal from "../../components/BookingModal";
import axios from "../../api/axios";

const GuestBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get logged-in user ID from token
  const token = localStorage.getItem("token");
  const payload = token ? JSON.parse(atob(token.split(".")[1])) : null;
  const userId = payload?.id;

  // Fetch guest's bookings and available rooms
  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, roomsRes] = await Promise.all([
        axios.get("/bookings/my"),
        axios.get("/rooms"),
      ]);
      // No need to filter, backend already returns only this guest's bookings
      setBookings(bookingsRes.data);
      setRooms(roomsRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setBookings([]);
      setRooms([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  // Create or update booking
  const handleSave = async (bookingData) => {
    try {
      if (editingBooking) {
        // Edit booking
        await axios.put(`/bookings/${editingBooking._id}`, {
          ...bookingData,
          guest: userId,
        });
      } else {
        // Create booking
        await axios.post("/bookings", {
          ...bookingData,
          guest: userId,
        });
      }
      setModalOpen(false);
      setEditingBooking(null);
      fetchData();
    } catch (error) {
      alert("Failed to save booking: " + (error.response?.data?.message || error.message));
    }
  };

  // Delete booking
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        await axios.delete(`/bookings/${id}`);
        fetchData();
      } catch (error) {
        alert("Failed to delete booking: " + (error.response?.data?.message || error.message));
      }
    }
  };

  // Open modal for editing
  const handleEdit = (booking) => {
    setEditingBooking(booking);
    setModalOpen(true);
  };

  // Open modal for creating
  const handleCreate = () => {
    setEditingBooking(null);
    setModalOpen(true);
  };

  // Handle invoice generation/viewing
  const handleInvoice = async (bookingId) => {
    try {
      console.log("Requesting invoice for bookingId:", bookingId); // Debug log
      const response = await axios.get(`/invoices/booking/${bookingId}`);
      if (response.data) {
        // Invoice exists, display it
        displayInvoice(response.data);
      } else {
        // No invoice found, create one
        await generateInvoice(bookingId);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // No invoice found, create one
        await generateInvoice(bookingId);
      } else {
        alert("Failed to load invoice: " + (error.response?.data?.message || error.message));
        console.error("Invoice load error:", error);
      }
    }
  };

  // Generate invoice for a booking
  const generateInvoice = async (bookingId) => {
    try {
      const booking = bookings.find(b => b._id === bookingId);
      if (!booking) {
        alert("Booking not found.");
        return;
      }

      console.log("Booking data:", booking); // Debug log

      // Calculate total amount
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      const roomRate = booking.room?.price || 150; // Default rate with higher fallback
      const totalAmount = nights * roomRate;

      console.log("Invoice calculation:", { nights, roomRate, totalAmount }); // Debug log

      // Ensure we have valid numbers
      if (nights <= 0 || roomRate <= 0) {
        alert("Unable to calculate invoice amount. Please check booking dates and room information.");
        return;
      }

      const invoiceData = {
        booking: bookingId,
        items: [
          {
            description: `Room ${booking.room?.roomNumber} - ${booking.room?.type} (${nights} night${nights > 1 ? 's' : ''})`,
            amount: totalAmount
          }
        ],
        totalAmount: totalAmount
      };

      console.log("Invoice data to send:", invoiceData); // Debug log

      const response = await axios.post('/invoices', invoiceData);
      displayInvoice(response.data);
    } catch (error) {
      console.error("Invoice generation error:", error);
      alert("Failed to generate invoice: " + (error.response?.data?.error || error.message));
    }
  };

  // Display invoice in a new window or modal
  const displayInvoice = (invoice) => {
    const booking = invoice.booking || bookings.find(b => b._id === invoice.booking);
    
    // Debug logs
    console.log("Invoice data:", invoice);
    console.log("Booking data for invoice:", booking);
    
    // Fallback calculation if invoice amount is 0
    if (invoice.totalAmount === 0 && booking) {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      const roomRate = booking.room?.price || 150; // Default fallback rate
      const calculatedTotal = nights * roomRate;
      
      console.log("Recalculating due to zero amount:", { nights, roomRate, calculatedTotal });
      
      // Update the invoice display with calculated values
      invoice.totalAmount = calculatedTotal;
      invoice.items = [{
        description: `Room ${booking.room?.roomNumber} - ${booking.room?.type} (${nights} night${nights > 1 ? 's' : ''})`,
        amount: calculatedTotal
      }];
    }
    
    const invoiceWindow = window.open('', '_blank', 'width=800,height=600');
    
    invoiceWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${booking?.room?.roomNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .invoice-details { margin-bottom: 20px; }
            .invoice-details div { margin: 5px 0; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f2f2f2; }
            .total { font-weight: bold; font-size: 18px; margin-top: 20px; text-align: right; }
            .print-btn { background: #007bff; color: white; border: none; padding: 10px 20px; cursor: pointer; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Luxury Stay Hotel</h1>
            <h2>Invoice</h2>
          </div>
          
          <div class="invoice-details">
            <div><strong>Invoice Date:</strong> ${new Date(invoice.issuedAt).toLocaleDateString()}</div>
            <div><strong>Booking ID:</strong> ${invoice.booking._id || invoice.booking}</div>
            <div><strong>Room:</strong> ${booking?.room?.roomNumber} - ${booking?.room?.type}</div>
            <div><strong>Check-in:</strong> ${booking?.checkInDate?.slice(0, 10)}</div>
            <div><strong>Check-out:</strong> ${booking?.checkOutDate?.slice(0, 10)}</div>
            <div><strong>Guest:</strong> ${booking?.guest?.name || 'N/A'}</div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>$${item.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total">
            Total Amount: $${invoice.totalAmount.toFixed(2)}
          </div>

          <button class="print-btn" onclick="window.print()">Print Invoice</button>
          <button class="print-btn" onclick="window.close()" style="background: #6c757d; margin-left: 10px;">Close</button>
        </body>
      </html>
    `);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">My Bookings</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleCreate}
        >
          New Booking
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Room</th>
              <th className="py-2 px-4 border-b">Check-In</th>
              <th className="py-2 px-4 border-b">Check-Out</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td className="py-2 px-4 border-b">
                  {b.room?.roomNumber} - {b.room?.type}
                </td>
                <td className="py-2 px-4 border-b">
                  {b.checkInDate?.slice(0, 10)}
                </td>
                <td className="py-2 px-4 border-b">
                  {b.checkOutDate?.slice(0, 10)}
                </td>
                <td className="py-2 px-4 border-b">{b.status}</td>
                <td className="py-2 px-4 border-b space-x-2">
                  <button
                    className="bg-yellow-400 text-white px-3 py-1 rounded"
                    onClick={() => handleEdit(b)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() => handleDelete(b._id)}
                  >
                    Delete
                  </button>
                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded"
                    onClick={() => handleInvoice(b._id)}
                  >
                    Invoice
                  </button>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <BookingModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingBooking(null);
        }}
        onSave={handleSave}
        guests={[]} // not needed for guest
        rooms={rooms}
        initialBooking={editingBooking}
      />
    </div>
  );
};

export default GuestBookings;