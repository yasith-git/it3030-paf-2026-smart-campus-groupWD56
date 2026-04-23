import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true
});

const bookingService = {
    createBooking: async (bookingData) => {
        const response = await api.post('/bookings', bookingData);
        return response.data;
    },

    getMyBookings: async () => {
        const response = await api.get('/bookings/my');
        return response.data;
    },

    getAllBookings: async () => {
        const response = await api.get('/bookings');
        return response.data;
    },

    getBookingById: async (id) => {
        const response = await api.get(`/bookings/${id}`);
        return response.data;
    },

    decideBooking: async (id, decision, reason) => {
        const params = new URLSearchParams({
            decision,
            ...(reason && { reason })
        });
        const response = await api.patch(`/bookings/${id}/decision?${params}`);
        return response.data;
    },

    cancelBooking: async (id) => {
        const response = await api.patch(`/bookings/${id}/cancel`);
        return response.data;
    }
};

export default bookingService;