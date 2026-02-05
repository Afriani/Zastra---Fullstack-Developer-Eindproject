import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import "../../css/ADMIN DASHBOARD/myinbox.css";
import unreadIcon from "../../assets/pictures/my-inbox/right-speech-ballon.png";
import readIcon from "../../assets/pictures/my-inbox/left-speech-ballon.png";

function MyInbox() {
    const [activeTab, setActiveTab] = useState("received");
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [selectedItem, setSelectedItem] = useState(null);
    const [threadLoading, setThreadLoading] = useState(false);
    const [threadError, setThreadError] = useState("");
    const [threadMessages, setThreadMessages] = useState([]);
    const [quickReply, setQuickReply] = useState("");

    const [showNewMessageModal, setShowNewMessageModal] = useState(false);
    const [newConversation, setNewConversation] = useState({
        recipientEmail: "",
        reportId: "",
        subject: "",
        content: "",
    });

    const location = useMemo(() => window.location, []);
    const token = useMemo(() => localStorage.getItem("token"), []);
    const authHeaders = useMemo(
        () => ({ Authorization: `Bearer ${token}` }),
        [token]
    );

    useEffect(() => {
        fetchTabItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    // Handle opening conversation from URL query parameter
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const conversationId = params.get("conversationId");

        if (conversationId && items.length > 0) {
            const conversationToOpen = items.find(
                (item) => item.id === parseInt(conversationId, 10)
            );
            if (conversationToOpen) {
                openItem(conversationToOpen);
                // Remove query parameter from URL
                params.delete("conversationId");
                const newSearch = params.toString();
                window.history.replaceState(
                    null,
                    "",
                    `${location.pathname}${
                        newSearch ? `?${newSearch}` : ""
                    }`
                );
            }
        }
    }, [items, location.search]);

    const fetchTabItems = async () => {
        setLoading(true);
        setError("");
        try {
            const url =
                activeTab === "received"
                    ? "http://localhost:8080/api/admin/conversations/inbox"
                    : "http://localhost:8080/api/admin/conversations/sent";
            const res = await axios.get(url, { headers: authHeaders });

            const conversations = (res.data || []).map((c) => ({
                id: c.id,
                title: c.title || "Conversation",
                message: c.message,
                timestamp: c.timestamp,
                unread: c.unread,
                participants: c.participants,
            }));
            conversations.sort(
                (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
            );
            setItems(conversations);
        } catch (err) {
            console.error("Error fetching conversations:", err);
            setError("Failed to load conversations. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSort = () => {
        setItems((prev) =>
            [...prev].sort(
                (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
            )
        );
    };

    const openItem = async (item) => {
        setSelectedItem(item);
        setThreadLoading(true);
        setThreadError("");
        setThreadMessages([]);
        try {
            const res = await axios.get(
                `http://localhost:8080/api/admin/conversations/${item.id}/messages`,
                { headers: authHeaders }
            );
            setThreadMessages(res.data || []);
            if (activeTab === "received") {
                setItems((prev) =>
                    prev.map((x) =>
                        x.id === item.id ? { ...x, unread: false } : x
                    )
                );
            }
        } catch (err) {
            console.error("Error loading conversation:", err);
            setThreadError("Failed to load conversation.");
        } finally {
            setThreadLoading(false);
        }
    };

    const sendConversationReply = async () => {
        if (!selectedItem || !quickReply.trim()) return;
        try {
            await axios.post(
                "http://localhost:8080/api/admin/conversations",
                {
                    conversationId: selectedItem.id,
                    content: quickReply.trim(),
                },
                { headers: { ...authHeaders, "Content-Type": "application/json" } }
            );
            setQuickReply("");
            await openItem(selectedItem);
            await fetchTabItems();
        } catch (err) {
            console.error("Error sending reply:", err);
            alert("Failed to send reply.");
        }
    };

    const handleSendNewConversation = async (e) => {
        e.preventDefault();
        if (
            !newConversation.recipientEmail ||
            !newConversation.content?.trim()
        ) {
            alert("Please fill in recipient email and message.");
            return;
        }
        try {
            await axios.post(
                "http://localhost:8080/api/admin/conversations",
                {
                    recipientEmail: newConversation.recipientEmail.trim(),
                    reportId: newConversation.reportId
                        ? Number(newConversation.reportId)
                        : null,
                    subject: newConversation.subject || "",
                    content: newConversation.content.trim(),
                },
                { headers: { ...authHeaders, "Content-Type": "application/json" } }
            );
            setNewConversation({
                recipientEmail: "",
                reportId: "",
                subject: "",
                content: "",
            });
            setShowNewMessageModal(false);
            await fetchTabItems();
        } catch (err) {
            console.error("Error sending:", err);
            alert(
                err?.response?.data?.message ||
                "Failed to send. Please try again."
            );
        }
    };

    const deleteConversation = async () => {
        if (!selectedItem) return;
        if (
            !window.confirm(
                "Delete this conversation? This cannot be undone."
            )
        )
            return;
        try {
            await axios.delete(
                `http://localhost:8080/api/admin/conversations/${selectedItem.id}`,
                { headers: authHeaders }
            );
            setSelectedItem(null);
            await fetchTabItems();
        } catch (err) {
            console.error("Error deleting conversation:", err);
            alert("Failed to delete conversation.");
        }
    };

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    const availableTabs = [
        { key: "received", label: "Received" },
        { key: "sent", label: "Sent" },
    ];

    return (
        <div className="dashboard">
            <div className="inbox-container">
                <div className="inbox-header">
                    <h2>My Inbox</h2>
                </div>

                <div className="btn-container">
                    <button
                        className="btn-new-message"
                        onClick={() => setShowNewMessageModal(true)}
                    >
                        Compose Message
                    </button>
                    {selectedItem && (
                        <button
                            className="btn-delete"
                            onClick={deleteConversation}
                        >
                            Delete Conversation
                        </button>
                    )}
                </div>

                <div className="tabs">
                    {availableTabs.map((tab) => (
                        <button
                            key={tab.key}
                            className={
                                activeTab === tab.key ? "tab active" : "tab"
                            }
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="folder-table">
                    <button className="btn-sort" onClick={handleSort}>
                        Sort by Date
                    </button>

                    {loading && (
                        <div className="loading">
                            Loading conversations...
                        </div>
                    )}
                    {error && <div className="error-message">{error}</div>}
                    {!loading && !error && items.length === 0 && (
                        <div className="no-messages">No conversations found.</div>
                    )}

                    {!loading &&
                        !error &&
                        items.map((item) => (
                            <div
                                key={`${item.id}`}
                                className={`folder-row ${
                                    item.unread && activeTab === "received"
                                        ? "unread"
                                        : ""
                                }`}
                                onClick={() => openItem(item)}
                            >
                                <div className="folder-icon">
                                    {item.unread && activeTab === "received" ? (
                                        <img src={unreadIcon} alt="Unread" className="my-inbox-icons" />
                                    ) : (
                                        <img src={readIcon} alt="Read" className="my-inbox-icons" />
                                    )}
                                </div>
                                <div className="folder-details">
                                    <div className="folder-subject">
                                        {item.title}
                                    </div>
                                    {item.participants && (
                                        <div className="folder-participants">
                                            {item.participants}
                                        </div>
                                    )}
                                    <div className="folder-snippet">
                                        {item.message?.length > 60
                                            ? `${item.message.substring(
                                                0,
                                                60
                                            )}...`
                                            : item.message}
                                    </div>
                                    <div className="folder-meta">
                                        <span className="folder-date">
                                            {formatDate(item.timestamp)}
                                        </span>
                                        <span className="folder-status">
                                            {activeTab === "received"
                                                ? item.unread
                                                    ? "Unread"
                                                    : "Read"
                                                : "Sent"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>

                {selectedItem && (
                    <div className="thread-container">
                        <div className="thread-header">
                            <h3>{selectedItem.title}</h3>
                            <button
                                className="btn-close"
                                onClick={() => setSelectedItem(null)}
                            >
                                ✕
                            </button>
                        </div>

                        {threadLoading && (
                            <div className="loading">
                                Loading conversation...
                            </div>
                        )}
                        {threadError && (
                            <div className="error-message">{threadError}</div>
                        )}

                        {!threadLoading && !threadError && (
                            <div className="messages-list">
                                {threadMessages.map((m) => (
                                    <div key={m.id} className="message-item">
                                        <div className="message-content">
                                            <strong>{m.senderName}</strong>
                                            <div className="message-time">
                                                {new Date(
                                                    m.createdAt
                                                ).toLocaleString()}
                                            </div>
                                            <div className="message-text">
                                                {m.content}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="composer">
                            <textarea
                                placeholder="Type your message..."
                                rows={3}
                                value={quickReply}
                                onChange={(e) =>
                                    setQuickReply(e.target.value)
                                }
                            />
                            <button
                                className="send-btn"
                                onClick={sendConversationReply}
                            >
                                Send
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showNewMessageModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Compose Message</h3>
                        <form onSubmit={handleSendNewConversation}>
                            <div className="form-group">
                                <label>Recipient Email:</label>
                                <input
                                    type="email"
                                    value={newConversation.recipientEmail}
                                    onChange={(e) =>
                                        setNewConversation((s) => ({
                                            ...s,
                                            recipientEmail: e.target.value,
                                        }))
                                    }
                                    placeholder="user@example.com"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Report ID (optional):</label>
                                <input
                                    type="number"
                                    value={newConversation.reportId}
                                    onChange={(e) =>
                                        setNewConversation((s) => ({
                                            ...s,
                                            reportId: e.target.value,
                                        }))
                                    }
                                    placeholder="e.g., 123"
                                />
                            </div>
                            <div className="form-group">
                                <label>Subject (optional):</label>
                                <input
                                    type="text"
                                    value={newConversation.subject}
                                    onChange={(e) =>
                                        setNewConversation((s) => ({
                                            ...s,
                                            subject: e.target.value,
                                        }))
                                    }
                                    placeholder="Subject"
                                />
                            </div>
                            <div className="form-group">
                                <label>Message:</label>
                                <textarea
                                    value={newConversation.content}
                                    onChange={(e) =>
                                        setNewConversation((s) => ({
                                            ...s,
                                            content: e.target.value,
                                        }))
                                    }
                                    rows="4"
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="btn-send">
                                    Send
                                </button>
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() =>
                                        setShowNewMessageModal(false)
                                    }
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyInbox;