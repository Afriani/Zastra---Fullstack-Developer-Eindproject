// src/pages/Messages/ConversationView.jsx
import React, {useCallback, useEffect, useRef, useState, useMemo} from "react";
import axios from "axios";

function ConversationView({ conversationId, onBack, onConversationUpdated }) {
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const authHeaders = useMemo(() => ({Authorization: `Bearer ${token}`,}), [token]);
    const messagesEndRef = useRef(null);

    const fetchMessages = useCallback(async () => {
        try {
            const res = await axios.get(`/api/conversations/${conversationId}/messages`, { headers: authHeaders });
            setMessages(res.data);
        } catch (err) {
            console.error("Failed fetch messages", err);
        } finally {
            setLoading(false);
        }
    }, [conversationId, authHeaders]);

    useEffect(() => {
        fetchMessages();
        const poll = setInterval(fetchMessages, 5000);
        return () => clearInterval(poll);
    }, [fetchMessages]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        try {
            const payload = {
                conversationId,
                content: content.trim()
            };

            const res = await axios.post("/api/conversations", payload, { headers: authHeaders });
            setMessages(prev => [...prev, res.data]);
            setContent("");
            onConversationUpdated?.();
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    return (
        <div className="conversation-view">
            <header className="conv-header">
                <button onClick={onBack} className="back-btn">← Back</button>
                <h3>Conversation #{conversationId}</h3>
            </header>

            <div className="messages-list">
                {loading ? <div>Loading...</div> : null}
                {messages.map(m => (
                    <div key={m.id} className={`message-item ${m.isOwn ? "own" : ""}`}>
                        <div className="message-meta">
                            <strong>{m.senderName}</strong>
                            <span className="time">{new Date(m.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="message-content">{m.content}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form className="composer" onSubmit={handleSend}>
        <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a message..."
            rows={2}
        />
                <button type="submit" className="send-btn">Send</button>
            </form>
        </div>
    );
}

export default ConversationView;