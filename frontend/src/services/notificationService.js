import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
    };
};

const notificationService = {
    // Get all notifications for the current user
    getNotifications: async () => {
        const response = await axios.get(`${BASE_URL}/api/notifications`, {
            headers: getHeaders(),
        });
        return response.data;
    },

    // Get unread notification count
    getUnreadCount: async () => {
        const response = await axios.get(`${BASE_URL}/api/notifications/unread/count`, {
            headers: getHeaders(),
        });
        return response.data.count; // FIXED: Extract the count property
    },

    // Mark a notification as read
    markAsRead: async (notificationId) => {
        const response = await axios.put(
            `${BASE_URL}/api/notifications/${notificationId}/read`,
            {},
            { headers: getHeaders() }
        );
        return response.data;
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        const response = await axios.put(
            `${BASE_URL}/api/notifications/read-all`,
            {},
            { headers: getHeaders() }
        );
        return response.data;
    },

    // Delete a notification
    deleteNotification: async (notificationId) => {
        const response = await axios.delete(
            `${BASE_URL}/api/notifications/${notificationId}`,
            { headers: getHeaders() }
        );
        return response.data;
    },
};

export default notificationService;