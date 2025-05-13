import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const NotificationDropdown = ({ userId }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const dropdownRef = useRef(null);
    const stompClientRef = useRef(null);

    // Formatage de l'heure
    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Regroupement des notifications
    const groupedNotifications = notifications.reduce((acc, notification) => {
        if (notification.isRead) {
            acc.push({ ...notification });
            return acc;
        }

        const existing = acc.find(n => n.senderId === notification.senderId && !n.isRead);
        if (existing) {
            existing.messageCount += notification.messageCount;
            if (new Date(notification.lastMessageTime) > new Date(existing.lastMessageTime)) {
                existing.lastMessageTime = notification.lastMessageTime;
                existing.messagePreview = notification.messagePreview;
            }
        } else {
            acc.push({ ...notification });
        }
        return acc;
    }, []).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    // Fermeture du dropdown quand on clique ailleurs
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Récupération des notifications
    const fetchNotifications = async () => {
        try {
            const response = await axios.get(
                `http://localhost:1217/api/messages/notifications?userId=${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNotifications(response.data);
            setUnreadCount(response.data.filter(n => !n.isRead).length);
        } catch (err) {
            console.error("Erreur lors du chargement des notifications", err);
        }
    };

    // Marquage d'une notification comme lue
    const markNotificationAsRead = async (notificationId) => {
        try {
            await axios.post(
                `http://localhost:1217/api/messages/notifications/${notificationId}/read`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId ? { ...n, isRead: true } : n
                )
            );
            setUnreadCount(prev => prev - 1);
        } catch (err) {
            console.error("Erreur lors du marquage comme lu", err);
        }
    };

    // Marquage de toutes les notifications comme lues
    const markAllNotificationsAsRead = async () => {
        try {
            await axios.post(
                `http://localhost:1217/api/messages/notifications/mark-all-read`,
                { userId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Solution optimale : recharger depuis le serveur
            await fetchNotifications();
        } catch (err) {
            console.error("Erreur lors du marquage comme lu", err);
        }
    };

    // Gestion du clic sur une notification
    const handleNotificationClick = (notification) => {
        markNotificationAsRead(notification.id);
        navigate(`/ChatPage?receiverId=${notification.senderId}`);
        setShowNotifications(false);
    };

    // Initialisation et WebSocket
    useEffect(() => {
        if (!userId || !token) return;

        fetchNotifications();

        const client = new Client({
            webSocketFactory: () => new SockJS("http://localhost:1217/ws"),
            connectHeaders: { Authorization: `Bearer ${token}` },
            onConnect: () => {
                console.log("✅ Connecté aux notifications WebSocket");

                // Abonnement aux nouvelles notifications
                client.subscribe(`/topic/notifications/${userId}`, (message) => {
                    const updatedNotification = JSON.parse(message.body);

                    setNotifications(prev => {
                        // Suppression des anciennes notifications du même expéditeur non lues
                        const filtered = prev.filter(n =>
                            !(n.senderId === updatedNotification.senderId && !n.isRead)
                        );
                        return [updatedNotification, ...filtered];
                    });

                    setUnreadCount(prev => prev + 1);
                });

                // Abonnement aux suppressions de notifications
                client.subscribe(`/topic/notifications/removed/${userId}`, (message) => {
                    const deletedMessageId = JSON.parse(message.body);
                    setNotifications(prev =>
                        prev.filter(n => n.messageId !== deletedMessageId)
                    );
                    setUnreadCount(prev => Math.max(0, prev - 1));
                });
            },
            onStompError: (frame) => {
                console.error("❌ Erreur STOMP", frame);
            }
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, [userId, token]);

    return (
        <div ref={dropdownRef} style={{ position: 'relative', marginLeft: 'auto' }}>
            <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                    padding: '8px 16px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    position: 'relative'
                }}
            >
                <i className="fas fa-bell"></i>
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        backgroundColor: 'red',
                        color: 'white',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {showNotifications && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    zIndex: 1000,
                    width: 350,
                    maxHeight: '70vh',
                    overflowY: 'auto',
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    padding: '10px 0'
                }}>
                    <div style={{
                        padding: '10px 15px',
                        borderBottom: '1px solid #eee',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <strong style={{ fontSize: 16 }}>Notifications</strong>
                        {unreadCount > 0 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    markAllNotificationsAsRead();
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#2196F3',
                                    cursor: 'pointer',
                                    fontSize: 14,
                                    fontWeight: 'bold'
                                }}
                            >
                                Tout marquer comme lu
                            </button>
                        )}
                    </div>

                    {groupedNotifications.length === 0 ? (
                        <div style={{
                            padding: 20,
                            textAlign: 'center',
                            color: '#666'
                        }}>
                            Aucune notification
                        </div>
                    ) : (
                        groupedNotifications.map(notification => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                style={{
                                    padding: '12px 15px',
                                    borderBottom: '1px solid #f5f5f5',
                                    cursor: 'pointer',
                                    backgroundColor: !notification.isRead ? '#f8fbff' : 'white',
                                    ':hover': {
                                        backgroundColor: '#f0f7ff'
                                    }
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10
                                }}>
                                    <div style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        backgroundColor: !notification.isRead ? '#2196F3' : 'transparent',
                                        flexShrink: 0
                                    }} />

                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between'
                                        }}>
                                            <span style={{
                                                fontWeight: 'bold',
                                                color: !notification.isRead ? '#2196F3' : '#333'
                                            }}>
                                                {notification.senderName}
                                            </span>
                                            <span style={{
                                                fontSize: 12,
                                                color: '#999'
                                            }}>
                                                {formatTime(notification.lastMessageTime)}
                                            </span>
                                        </div>

                                        <div style={{
                                            fontSize: 14,
                                            color: '#555',
                                            marginTop: 4,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {notification.messagePreview}
                                        </div>

                                        {notification.messageCount > 1 && !notification.isRead && (
                                            <div style={{
                                                fontSize: 12,
                                                color: '#2196F3',
                                                marginTop: 4,
                                                display: 'inline-block',
                                                backgroundColor: '#e3f2fd',
                                                padding: '2px 6px',
                                                borderRadius: 10
                                            }}>
                                                {notification.messageCount} messages
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;