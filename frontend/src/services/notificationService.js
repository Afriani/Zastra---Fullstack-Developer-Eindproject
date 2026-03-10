import axiosInstance from '../api/axiosInstance';

const notificationService = {
    // Get all notifications for the current user
    getNotifications: async () => {
        const response = await axiosInstance.get('/api/notifications');
        return response.data;
    },

    // Get unread notification count
    getUnreadCount: async () => {
        const response = await axiosInstance.get('/api/notifications/unread/count');
        return response.data.count;
    },

    // Mark a notification as read
    markAsRead: async (notificationId) => {
        const response = await axiosInstance.put(`/api/notifications/${notificationId}/read`);
        return response.data;
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        const response = await axiosInstance.put('/api/notifications/read-all');
        return response.data;
    },

    // Delete a notification
    deleteNotification: async (notificationId) => {
        const response = await axiosInstance.delete(`/api/notifications/${notificationId}`);
        return response.data;
    },
};

export default notificationService;