import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import '../css/USER DASHBOARD/notificationbell.css';
import notificationService from '../services/notificationService';
import axiosInstance from '../api/axiosInstance';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const dropdownRef = useRef(null);
    const stompClientRef = useRef(null);
    const stompSubscriptionRef = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchNotifications();
    }, []);

    // WebSocket connection using SockJS + STOMP
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Get API base from environment
        let apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8080';

        // Remove trailing slash if present
        apiBase = apiBase.replace(/\/+$/, '');

        // SockJS expects an HTTP URL, NOT a full WS URL
        const sockJsUrl = `${apiBase}/ws-notifications`;

        const stompClient = new Client({
            webSocketFactory: () => new SockJS(sockJsUrl),
            reconnectDelay: 5000,
            debug: (msg) => import.meta.env.DEV && console.log('[STOMP]', msg),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            }
        });

        stompClient.onConnect = () => {
            console.log('Connected to notifications websocket');

            const sub = stompClient.subscribe('/user/queue/notifications', async (message) => {
                try {
                    const notif = JSON.parse(message.body);

                    if (!notif?.id) return;

                    setNotifications(prev =>
                        prev.some(n => n.id === notif.id)
                            ? prev
                            : [notif, ...prev]
                    );

                    const valid = await validateNotificationTarget(notif);
                    if (!valid) {
                        setNotifications(prev => prev.filter(n => n.id !== notif.id));
                        return;
                    }

                    if (!notif.isRead) {
                        setUnreadCount(prev => prev + 1);
                    }
                } catch (e) {
                    console.error('Error processing notification', e);
                }
            });

            stompClientRef.current = stompClient;
            stompSubscriptionRef.current = sub;
        };

        stompClient.activate();

        return () => {
            stompSubscriptionRef.current?.unsubscribe();
            stompClientRef.current?.deactivate();
        };
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const list = await notificationService.getNotifications();

            if (!Array.isArray(list)) {
                setNotifications([]);
                setUnreadCount(0);
                return;
            }

            const valid = await filterValidNotifications(list);
            setNotifications(valid);
            setUnreadCount(valid.filter(n => !n.isRead).length);
        } catch (e) {
            console.error('Failed to fetch notifications:', e);
        } finally {
            setLoading(false);
        }
    };

    const validateNotificationTarget = async (notification) => {
        try {
            if (notification.type === 'ANNOUNCEMENT' && notification.relatedId) {
                await axiosInstance.get(`/api/announcements/${notification.relatedId}`);
            }
            return true;
        } catch (err) {
            if (err.response?.status === 404) return false;
            return true;
        }
    };

    const filterValidNotifications = async (list) => {
        const checks = list.map(async n => {
            const valid = await validateNotificationTarget(n);
            return valid ? n : null;
        });

        const out = await Promise.all(checks);
        return out.filter(Boolean);
    };

    const inboxRouteForCurrentPath = () => {
        const p = location.pathname;
        if (p.includes('/admin')) return '/admin/inbox';
        if (p.includes('/officer')) return '/officer/inbox';
        return '/my-inbox';
    };

    const handleNotificationClick = async (notification) => {
        const type = (notification.type || '')
            .toString()
            .trim()
            .toUpperCase()
            .replace(/[\s-]+/g, '_');

        try {
            if (!notification.isRead) {
                await notificationService.markAsRead(notification.id);
                setUnreadCount(prev => Math.max(0, prev - 1));
                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
                );
            }

            const related = notification.relatedId ?? notification.reportId;

            let target = '/dashboard';

            if (type === 'ANNOUNCEMENT') {
                target = `/user/announcements/${related}`;
            } else if (['MESSAGE', 'CONVERSATION'].includes(type)) {
                target = `${inboxRouteForCurrentPath()}?conversationId=${related}`;
            } else if (['STATUS_UPDATE', 'REPORT_UPDATE', 'REPORT'].includes(type)) {
                if (location.pathname.includes('/admin')) target = `/admin/reports/${related}`;
                else if (location.pathname.includes('/officer')) target = `/officer/reports/${related}`;
                else target = `/user-report/${related}`;
            }

            navigate(target);
            setIsOpen(false);
        } catch (e) {
            console.error('Notification click failed:', e);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const parseTime = (t) => {
        const d = typeof t === 'number' ? new Date(t) : new Date(t);
        return isNaN(d.getTime()) ? null : d;
    };

    const formatTimestamp = (ts) => {
        const date = parseTime(ts);
        if (!date) return '';
        const now = new Date();
        const diffMs = now - date;
        const mins = Math.floor(diffMs / 60000);
        const hrs = Math.floor(diffMs / 3600000);
        const days = Math.floor(diffMs / 86400000);

        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        if (hrs < 24) return `${hrs}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="notification-bell-container" ref={dropdownRef}>
            <button className="notification-bell-button" onClick={() => setIsOpen(v => !v)}>
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button className="mark-all-read-btn" onClick={handleMarkAllAsRead}>
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="notification-list">
                        {loading ? (
                            <div className="notification-loading">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="notification-empty">
                                <Bell size={40} />
                                <p>No notifications</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    className={`notification-item ${!n.isRead ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(n)}
                                >
                                    <div className="notification-content">
                                        <h4>{n.title}</h4>
                                        <p>{n.message}</p>
                                        <span className="notification-time">
                                            {formatTimestamp(n.createdAt)}
                                        </span>
                                    </div>
                                    {!n.isRead && <div className="notification-dot" />}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;