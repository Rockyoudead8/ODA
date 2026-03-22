import React, { useEffect, useState, useRef } from "react";
import { socket } from "../utils/socket";

const API = "http://localhost:8000/api/messages";

export default function ChatPage({ user }) {
  const [partners, setPartners] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const messagesContainerRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    socket.connect();
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const handleOnline = (users) => setOnlineUsers(users);

    const handleMessage = (msg) => {
      const otherUserId =
        msg.senderId?.toString() === user._id?.toString()
          ? msg.receiverId
          : msg.senderId;

      if (
        (msg.senderId?.toString() === selectedUser?._id?.toString() &&
          msg.receiverId?.toString() === user._id?.toString()) ||
        (msg.receiverId?.toString() === selectedUser?._id?.toString() &&
          msg.senderId?.toString() === user._id?.toString())
      ) {
        setMessages((prev) => [...prev, msg]);
      }

      setPartners((prev) => {
        const updated = [...prev];
        const index = updated.findIndex(
          (p) => p._id.toString() === otherUserId.toString()
        );

        if (index !== -1) {
          const [userObj] = updated.splice(index, 1);
          updated.unshift(userObj);
        }

        return updated;
      });
    };

    const handleTyping = ({ from }) => {
      if (from === selectedUser?._id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 1500);
      }
    };

    socket.on("getOnlineUsers", handleOnline);
    socket.on("receive_message", handleMessage);
    socket.on("typing", handleTyping);

    return () => {
      socket.off("getOnlineUsers", handleOnline);
      socket.off("receive_message", handleMessage);
      socket.off("typing", handleTyping);
    };
  }, [selectedUser, user]);

  useEffect(() => {
    fetch(`${API}/chats`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setPartners(Array.isArray(data) ? data : []))
      .catch(() => setPartners([]));

    fetch(`${API}/users`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setAllUsers(Array.isArray(data) ? data : []))
      .catch(() => setAllUsers([]));
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const filtered = allUsers.filter(
      (u) =>
        u._id !== user._id &&
        u?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setSearchResults(filtered);
    setShowDropdown(true);
  }, [searchQuery, allUsers, user]);

  // ✅ auto scroll (simple delay fix)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight;
      }
    }, 150);

    return () => clearTimeout(timeout);
  }, [messages]);

  const loadMessages = (u) => {
    if (!u?._id) return;

    setSelectedUser({ ...u, lastSeen: u.lastSeen || null });

    fetch(`${API}/${u._id}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setMessages(Array.isArray(data) ? data : []))
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

    setPartners((prev) => {
      const updated = [...prev];
      const index = updated.findIndex(
        (p) => p._id.toString() === selectedUser._id.toString()
      );

      if (index !== -1) {
        const [userObj] = updated.splice(index, 1);
        updated.unshift(userObj);
      }

      return updated;
    });

    setText("");
  };

  if (!user || !user._id) {
    return <div className="p-5">Loading user...</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* LEFT PANEL */}
      <div className="w-72 bg-white border-r flex flex-col shadow-sm h-full">
        <div className="relative p-3">
          <input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
          />

          {showDropdown && searchQuery.trim() !== "" && (
            <div className="absolute top-full left-2 right-2 mt-2 bg-white border rounded-xl max-h-56 overflow-y-auto shadow-lg z-50">
              {searchResults.length > 0 ? (
                searchResults.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => {
                      loadMessages(u);
                      setSearchQuery("");
                      setShowDropdown(false);
                    }}
                    className="p-2 cursor-pointer border-b hover:bg-gray-100"
                  >
                    {u.name}
                  </div>
                ))
              ) : (
                <div className="p-2 text-gray-400">No users found</div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {partners.map((p) => {
            const isOnline = onlineUsers.includes(p?._id?.toString());

            return (
              <div
                key={p?._id}
                onClick={() => loadMessages(p)}
                className={`p-3 cursor-pointer flex items-center justify-between hover:bg-gray-100 transition ${
                  selectedUser?._id === p?._id ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">
                    {p?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span>{p?.name}</span>
                </div>

                <span
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {selectedUser ? (
          <>
            {/* HEADER */}
            <div className="p-4 border-b bg-white flex items-center gap-3 shadow-sm shrink-0 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                {selectedUser?.name?.charAt(0).toUpperCase()}
              </div>

              <div className="flex flex-col">
                <span className="font-semibold">{selectedUser?.name}</span>
                <span
                  className={`text-xs ${
                    isTyping
                      ? "text-blue-500"
                      : onlineUsers.includes(selectedUser?._id?.toString())
                      ? "text-green-500"
                      : "text-gray-400"
                  }`}
                >
                  {isTyping
                    ? "Typing..."
                    : onlineUsers.includes(selectedUser?._id?.toString())
                    ? "Online"
                    : "Offline"}
                </span>
              </div>
            </div>

            {/* MESSAGES */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-5 flex flex-col gap-3 min-h-0"
            >
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
                    className={`max-w-[65%] ${
                      isMe ? "self-end" : "self-start"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-2xl shadow-sm ${
                        isMe
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-white border rounded-bl-none"
                      }`}
                    >
                      {m?.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* INPUT */}
            <div className="p-3 bg-white border-t flex gap-2">
              <input
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  socket.emit("typing", {
                    to: selectedUser._id,
                    from: user._id,
                  });
                }}
                placeholder="Type a message..."
                className="flex-1 p-3 rounded-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />

              <button
                onClick={sendMessage}
                className="px-5 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="m-auto text-gray-400 text-lg">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}