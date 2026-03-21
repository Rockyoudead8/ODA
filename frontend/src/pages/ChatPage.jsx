import React, { useEffect, useState, useMemo } from "react";
import { socket } from "../utils/socket";

const API = "http://localhost:8000/api/messages";

export default function ChatPage({ user }) {
  const [partners, setPartners] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    socket.connect();

    const handleOnline = (users) => setOnlineUsers(users);

    const handleMessage = (msg) => {
      if (
        msg.senderId?.toString() === selectedUser?._id?.toString() ||
        msg.receiverId?.toString() === selectedUser?._id?.toString()
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("getOnlineUsers", handleOnline);
    socket.on("receive_message", handleMessage);

    return () => {
      socket.off("getOnlineUsers", handleOnline);
      socket.off("receive_message", handleMessage);
      socket.disconnect();
    };
  }, [selectedUser]);

  useEffect(() => {
    fetch(`${API}/users`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPartners(data);
        else setPartners([]);
      })
      .catch(() => setPartners([]));
  }, []);

  const filteredPartners = useMemo(() => {
    return partners.filter((p) =>
      p?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [partners, searchQuery]);

  const loadMessages = (u) => {
    if (!u?._id) return;

    setSelectedUser(u);

    fetch(`${API}/${u._id}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMessages(data);
        else setMessages([]);
      })
      .catch(() => setMessages([]));
  };

  const sendMessage = async () => {
    if (!text.trim() || !selectedUser?._id) return;

    const res = await fetch(`${API}/send/${selectedUser._id}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const msg = await res.json();

    socket.emit("send_message", msg);

    setMessages((prev) => [...prev, msg]);
    setText("");
  };

  if (!user || !user._id) {
    return <div style={{ padding: 20 }}>Loading user...</div>;
  }

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Inter, sans-serif", background: "#f5f7fb" }}>

      {/* LEFT PANEL */}
      <div style={{
        width: "300px",
        background: "#fff",
        borderRight: "1px solid #eee",
        display: "flex",
        flexDirection: "column"
      }}>
        <div style={{ padding: "16px", borderBottom: "1px solid #eee" }}>
          <h2 style={{ margin: 0 }}>Chats</h2>
          <input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "10px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              outline: "none"
            }}
          />
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {filteredPartners.map((p) => {
            const isOnline = onlineUsers.includes(p?._id?.toString());

            return (
              <div
                key={p?._id}
                onClick={() => loadMessages(p)}
                style={{
                  padding: "12px 16px",
                  cursor: "pointer",
                  background: selectedUser?._id === p?._id ? "#eef3ff" : "transparent",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "0.2s"
                }}
              >
                <span style={{ fontWeight: 500 }}>{p?.name}</span>

                <span style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: isOnline ? "#22c55e" : "#ccc"
                }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {selectedUser ? (
          <>
            {/* HEADER */}
            <div style={{
              padding: "16px",
              borderBottom: "1px solid #eee",
              background: "#fff",
              fontWeight: 600
            }}>
              {selectedUser?.name}
            </div>

            {/* MESSAGES */}
            <div style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "10px"
            }}>
              {messages.map((m, i) => {
                const senderId =
                  typeof m.senderId === "object"
                    ? m.senderId._id
                    : m.senderId;

                const isMe =
                  senderId?.toString() === user?._id?.toString();

                return (
                  <div
                    key={i}
                    style={{
                      alignSelf: isMe ? "flex-end" : "flex-start",
                      maxWidth: "60%"
                    }}
                  >
                    <div style={{
                      padding: "10px 14px",
                      borderRadius: "16px",
                      background: isMe ? "#4f8cff" : "#e5e7eb",
                      color: isMe ? "#fff" : "#000",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
                    }}>
                      {m?.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* INPUT */}
            <div style={{
              display: "flex",
              padding: "12px",
              borderTop: "1px solid #eee",
              background: "#fff",
              gap: "10px"
            }}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "20px",
                  border: "1px solid #ddd",
                  outline: "none"
                }}
              />
              <button
                onClick={sendMessage}
                style={{
                  padding: "10px 16px",
                  borderRadius: "20px",
                  border: "none",
                  background: "#4f8cff",
                  color: "#fff",
                  cursor: "pointer"
                }}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div style={{ margin: "auto", color: "#888" }}>
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}