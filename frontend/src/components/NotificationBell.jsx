import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';

import '../css/USER DASHBOARD/notificationbell.css';
import notificationService from '../services/notificationService';

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // WebSocket connection & authenticated CONNECT headers
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('NotificationBell: no token found — skipping WS connection');
            return;
        }

        const stompClient = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws-notifications'),
            reconnectDelay: 5000,
            debug: (str) => {
                const isDev =
                    typeof window !== 'undefined' &&
                    window.env &&
                    window.env.NODE_ENV !== 'production';
                if (isDev) console.log('STOMP:', str);
            },
            connectHeaders: {
                Authorization: `Bearer ${token}`
            }
        });

        stompClient.onConnect = () => {
            console.log('Connected to notifications WS');

            const subscription = stompClient.subscribe('/user/queue/notifications', async (message) => {
                try {
                    const newNotif = JSON.parse(message.body);

                    if (!newNotif || !newNotif.id) {
                        console.warn('Ignoring notification without id', newNotif);
                        return;
                    }

                    setNotifications(prev => {
                        if (prev.some(n => n.id === newNotif.id)) {
                            return prev;
                        }
                        return [newNotif, ...prev];
                    });

                    // Validate target (announcement existence, etc.)
                    const valid = await validateNotificationTarget(newNotif);
                    if (!valid) {
                        setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
                        return;
                    }

                    if (!newNotif.isRead) {
                        setUnreadCount(prev => prev + 1);
                    }
                } catch (err) {
                    console.error('Failed to process WS notification', err);
                }
            });

            stompClientRef.current = stompClient;
            stompSubscriptionRef.current = subscription;
        };

        stompClient.onStompError = (frame) => {
            console.error('STOMP error', frame);
        };

        stompClient.onWebSocketClose = (event) => {
            console.warn('WebSocket closed', event);
        };

        stompClient.onWebSocketError = (event) => {
            console.error('WebSocket error', event);
        };

        stompClient.activate();
        stompClientRef.current = stompClient;

        return () => {
            try {
                if (stompSubscriptionRef.current) {
                    stompSubscriptionRef.current.unsubscribe();
                }
                if (stompClientRef.current) {
                    stompClientRef.current.deactivate();
                }
            } catch (e) {
                console.warn('Error during STOMP cleanup', e);
            } finally {
                console.log('Disconnected from notifications WS');
            }
        };
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const parseCreatedAt = (createdAt) => {
        if (!createdAt) return null;
        if (typeof createdAt === 'number') return new Date(createdAt);
        if (createdAt.seconds) return new Date(createdAt.seconds * 1000);
        return new Date(createdAt);
    };

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationService.getNotifications();
            if (!Array.isArray(data)) {
                setNotifications([]);
                setUnreadCount(0);
                return;
            }
            const validated = await filterValidNotifications(data);
            setNotifications(validated);
            const unread = validated.filter(n => !n.isRead).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBellClick = () => {
        setIsOpen(prev => {
            const opening = !prev;
            if (opening) fetchNotifications();
            return opening;
        });
    };

    const validateNotificationTarget = async (notification) => {
        try {
            if (notification.type === 'ANNOUNCEMENT' && notification.relatedId) {
                const token = localStorage.getItem('token');
                await axios.get(`http://localhost:8080/api/announcements/${notification.relatedId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                return true;
            }
            return true;
        } catch (err) {
            if (err.response?.status === 404) return false;
            console.error('Error validating notification target:', err);
            return true;
        }
    };

    const filterValidNotifications = async (notifList) => {
        const checks = notifList.map(async (n) => {
            const ok = await validateNotificationTarget(n);
            return ok ? n : null;
        });

        const settled = await Promise.allSettled(checks);
        const results = settled
            .map(r => (r.status === 'fulfilled' ? r.value : null))
            .filter(Boolean);

        return results;
    };

    // Determine the correct inbox route for the current dashboard
    const inboxRouteForCurrentPath = () => {
        const p = location.pathname || '';
        if (p.includes('/admin')) return '/admin/inbox';
        if (p.includes('/officer')) return '/officer/inbox';
        // user dashboard uses top-level /my-inbox route in your App.jsx
        return '/my-inbox';
    };

    const handleNotificationClick = async (notification) => {
        console.log('[NB] Clicked notification:', notification);
        const rawType = (notification?.type || '').toString();
        // Normalize type to an uppercase underscore form (e.g. "Status Update" -> "STATUS_UPDATE")
        const type = rawType.trim().toUpperCase().replace(/[\s-]+/g, '_');

        console.log('[NB] normalized type:', type, 'relatedId/raw keys:', notification?.relatedId, Object.keys(notification || {}));

        try {
            if (!notification.isRead) {
                await notificationService.markAsRead(notification.id);
                setUnreadCount(prev => Math.max(0, prev - 1));
                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
                );
            }

            // Try a few common places for the related id
            const relatedId =
                notification.relatedId ??
                notification.related_id ??
                notification.related ??
                notification.reportId ??
                notification.payload?.relatedId ??
                notification.payload?.id ??
                null;

            // For report-like notifications, ensure we have an id
            const reportTypes = new Set(['STATUS_UPDATE', 'STATUS_UPDATED', 'REPORT_UPDATE', 'REPORT', 'REPORT_UPDATED']);
            let target;
            if (type === 'ANNOUNCEMENT') {
                const id = relatedId ?? notification.relatedId;
                if (!id) {
                    console.warn('[NB] Announcement missing id', notification);
                    return;
                }
                target = `/user/announcements/${id}`;
            } else if (type === 'MESSAGE' || type === 'CONVERSATION') {
                const inboxRoute = inboxRouteForCurrentPath();
                const conv = relatedId ?? notification.relatedId ?? notification.conversationId;
                if (!conv) {
                    console.warn('[NB] Message notification missing conversation id', notification);
                    return;
                }
                target = `${inboxRoute}?conversationId=${conv}`;
            } else if (reportTypes.has(type)) {
                const idToUse = relatedId;
                if (!idToUse) {
                    console.warn('[NB] Report notification missing related id', notification);
                    return;
                }
                const p = location.pathname || '';
                if (p.includes('/admin')) {
                    target = `/admin/reports/${idToUse}`;
                } else if (p.includes('/officer')) {
                    target = `/officer/reports/${idToUse}`;
                } else {
                    target = `/user-report/${idToUse}`;
                }
            } else {
                // fallback route for unknown types
                target = "/dashboard";
            }

            console.log('[NB] Navigating to:', target, ' current pathname=', location.pathname);
            navigate(target);

            // remove forced hard-nav in production. keep only as a temporary debug if needed.
            setIsOpen(false);
        } catch (error) {
            console.error('Failed to handle notification click:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = parseCreatedAt(timestamp);
        if (!date || Number.isNaN(date.getTime())) return '';
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="notification-bell-container" ref={dropdownRef}>
            <button className="notification-bell-button" onClick={handleBellClick}>
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
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
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="notification-content">
                                        <h4>{notification.title}</h4>
                                        <p>{notification.message}</p>
                                        <span className="notification-time">
                                            {formatTimestamp(notification.createdAt)}
                                        </span>
                                    </div>
                                    {!notification.isRead && <div className="notification-dot"></div>}
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



