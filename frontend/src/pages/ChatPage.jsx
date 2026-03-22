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

  // ✅ NEW CHAT MODAL STATES
  const [showModal, setShowModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");

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

  // ✅ NEW CHAT LOGIC
  const toggleUser = (u) => {
    setSelectedUsers((prev) => {
      const exists = prev.find((x) => x._id === u._id);
      if (exists) return prev.filter((x) => x._id !== u._id);
      return [...prev, u];
    });
  };

  const handleCreateChat = () => {
    if (selectedUsers.length === 1) {
      loadMessages(selectedUsers[0]);
    } else if (selectedUsers.length > 1) {
      console.log("Create group:", groupName, selectedUsers);
      // socket.emit("create_group", { name: groupName, users: selectedUsers });
    }

    setShowModal(false);
    setSelectedUsers([]);
    setGroupName("");
  };

  if (!user || !user._id) {
    return <div className="p-5">Loading user...</div>;
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50 to-purple-100 flex">
      {/* LEFT PANEL */}
      <div className="w-72 h-full backdrop-blur-lg bg-white/70 border-r border-gray-300 flex flex-col shadow-lg">

        {/* ✅ NEW CHAT BUTTON */}
        <div className="p-3 border-b border-gray-200">
          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl transition"
          >
            + New Chat
          </button>
        </div>

        {/* SEARCH */}
        <div className="relative p-3 border-b border-gray-200">
          <input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-white/80"
          />

          {showDropdown && searchQuery.trim() !== "" && (
            <div className="absolute top-full left-2 right-2 mt-2 bg-white border border-gray-200 rounded-xl max-h-56 overflow-y-auto shadow-xl z-50">
              {searchResults.length > 0 ? (
                searchResults.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => {
                      loadMessages(u);
                      setSearchQuery("");
                      setShowDropdown(false);
                    }}
                    className="p-2.5 cursor-pointer border-b hover:bg-blue-50 transition"
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

        {/* USERS */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {partners.map((p) => {
            const isOnline = onlineUsers.includes(p?._id?.toString());

            return (
              <div
                key={p?._id}
                onClick={() => loadMessages(p)}
                className={`p-3 cursor-pointer flex items-center justify-between rounded-xl transition ${
                  selectedUser?._id === p?._id
                    ? "bg-blue-100"
                    : "hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center text-sm font-semibold">
                    {p?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-800">{p?.name}</span>
                    <span className={`text-xs ${isOnline ? "text-green-500" : "text-gray-400"}`}>
                      {isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>

                {p?.unreadCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {p.unreadCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL remains SAME */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-l border-gray-300">
        {selectedUser ? (
          <>
            <div className="p-4 border-b border-gray-300 bg-white flex items-center gap-3 shrink-0 sticky top-0 z-10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center font-semibold">
                {selectedUser?.name?.charAt(0).toUpperCase()}
              </div>

              <div className="flex flex-col">
                <span className="font-semibold text-gray-800">{selectedUser?.name}</span>
                <span className={`text-xs ${isTyping ? "text-blue-500" : onlineUsers.includes(selectedUser?._id?.toString()) ? "text-green-500" : "text-gray-400"}`}>
                  {isTyping ? "Typing..." : onlineUsers.includes(selectedUser?._id?.toString()) ? "Online" : "Offline"}
                </span>
              </div>
            </div>

            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
              {messages.map((m, i) => {
                const senderId = typeof m.senderId === "object" ? m.senderId._id : m.senderId;
                const isMe = senderId?.toString() === user?._id?.toString();

                return (
                  <div key={i} className={`max-w-[65%] ${isMe ? "self-end" : "self-start"}`}>
                    <div className={`p-3 rounded-2xl shadow-md text-sm ${isMe ? "bg-blue-500 text-white rounded-br-none" : "bg-white border border-gray-200 rounded-bl-none"}`}>
                      {m?.text}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-white border-t border-gray-300 flex gap-2 shrink-0 sticky bottom-0">
              <input
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  socket.emit("typing", { to: selectedUser._id, from: user._id });
                }}
                placeholder="Type a message..."
                className="flex-1 p-3 rounded-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />

              <button onClick={sendMessage} className="px-5 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition">
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="m-auto text-gray-400 text-lg">Select a chat to start messaging</div>
        )}
      </div>

      {/* ✅ MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-lg w-80 rounded-2xl shadow-xl p-4">
            <h2 className="text-lg font-semibold mb-3">New Chat</h2>

            <div className="max-h-40 overflow-y-auto space-y-2">
              {allUsers.map((u) => (
                <div
                  key={u._id}
                  onClick={() => toggleUser(u)}
                  className={`p-2 rounded-lg cursor-pointer border ${selectedUsers.find((x) => x._id === u._id) ? "bg-blue-100 border-blue-400" : "hover:bg-gray-100"}`}
                >
                  {u.name}
                </div>
              ))}
            </div>

            {selectedUsers.length > 1 && (
              <input
                placeholder="Group Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="mt-3 w-full p-2 border rounded-lg"
              />
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowModal(false)} className="px-3 py-1 rounded-lg bg-gray-200">
                Cancel
              </button>

              <button onClick={handleCreateChat} className="px-3 py-1 rounded-lg bg-blue-500 text-white">
                {selectedUsers.length > 1 ? "Create Group" : "New Chat"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
