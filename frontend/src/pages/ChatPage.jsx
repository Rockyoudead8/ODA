import React, { useEffect, useState, useRef, useCallback } from "react";
import { socket } from "../utils/socket";
import { Search, Plus, Send, Users, X, Check, Image, LogOut } from "lucide-react";

const API       = "http://localhost:8000/api/messages";
const GROUP_API = "http://localhost:8000/api/groups";

/* ── Avatar helper ────────────────────────────────────────────────────── */
function Avatar({ name, size = "md", gradient = "from-blue-500 to-indigo-500" }) {
  const sz = size === "sm"
    ? "w-8 h-8 text-xs"
    : size === "lg"
    ? "w-12 h-12 text-base"
    : "w-9 h-9 text-sm";
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br ${gradient} text-white flex items-center justify-center font-bold shrink-0`}>
      {name?.charAt(0).toUpperCase() ?? "?"}
    </div>
  );
}

export default function ChatPage({ user }) {
  const [partners,      setPartners]      = useState([]);
  const [selectedUser,  setSelectedUser]  = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [text,          setText]          = useState("");
  const [onlineUsers,   setOnlineUsers]   = useState([]);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [allUsers,      setAllUsers]      = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown,  setShowDropdown]  = useState(false);
  const [showModal,     setShowModal]     = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName,     setGroupName]     = useState("");
  const [modalSearch,   setModalSearch]   = useState("");
  const [groups,        setGroups]        = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isTyping,      setIsTyping]      = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // ── FIX 1: Image upload state ──────────────────────────────────────────
  const [imagePreview,  setImagePreview]  = useState(null); // base64 string
  const fileInputRef = useRef(null);

  const messagesContainerRef = useRef(null);

  /* ── socket ─────────────────────────────────────────────────────────── */
  useEffect(() => { socket.connect(); return () => socket.disconnect(); }, []);

  useEffect(() => {
    const handleOnline = (users) => setOnlineUsers(users);

    const handleMessage = (msg) => {
      const otherUserId =
        msg.senderId?.toString() === user._id?.toString() ? msg.receiverId : msg.senderId;
      if (
        (msg.senderId?.toString()   === selectedUser?._id?.toString() && msg.receiverId?.toString() === user._id?.toString()) ||
        (msg.receiverId?.toString() === selectedUser?._id?.toString() && msg.senderId?.toString()   === user._id?.toString())
      ) setMessages(prev => [...prev, msg]);
      setPartners(prev => {
        const u = [...prev];
        const i = u.findIndex(p => p._id.toString() === otherUserId?.toString());
        if (i !== -1) { const [x] = u.splice(i, 1); u.unshift(x); }
        return u;
      });
    };

    const handleGroupMessage = (msg) => {
      if (msg.groupId?.toString() === selectedGroup?._id?.toString())
        setMessages(prev => [...prev, msg]);
      setGroups(prev => {
        const g = [...prev];
        const i = g.findIndex(x => x._id.toString() === msg.groupId?.toString());
        if (i !== -1) { const [x] = g.splice(i, 1); g.unshift(x); }
        return g;
      });
    };

    const handleNewGroup = (group) =>
      setGroups(prev => prev.find(g => g._id === group._id) ? prev : [group, ...prev]);

    const handleTyping = ({ from }) => {
      if (from === selectedUser?._id) { setIsTyping(true); setTimeout(() => setIsTyping(false), 1500); }
    };

    // ── FIX 2 (leave group): listen for group_member_left ─────────────────
    const handleGroupMemberLeft = ({ groupId, userId: leftUserId }) => {
      if (leftUserId === user._id?.toString()) {
        // I was removed / left — clear state
        setGroups(prev => prev.filter(g => g._id.toString() !== groupId));
        setSelectedGroup(prev => prev?._id?.toString() === groupId ? null : prev);
        setMessages(prev => selectedGroup?._id?.toString() === groupId ? [] : prev);
      } else {
        // Someone else left — update member count
        setGroups(prev =>
          prev.map(g =>
            g._id.toString() === groupId
              ? { ...g, members: g.members.filter(m => m.toString() !== leftUserId) }
              : g
          )
        );
      }
    };

    socket.on("getOnlineUsers",        handleOnline);
    socket.on("receive_message",       handleMessage);
    socket.on("receive_group_message", handleGroupMessage);
    socket.on("new_group",             handleNewGroup);
    socket.on("typing",                handleTyping);
    socket.on("group_member_left",     handleGroupMemberLeft);
    return () => {
      socket.off("getOnlineUsers",        handleOnline);
      socket.off("receive_message",       handleMessage);
      socket.off("receive_group_message", handleGroupMessage);
      socket.off("new_group",             handleNewGroup);
      socket.off("typing",               handleTyping);
      socket.off("group_member_left",     handleGroupMemberLeft);
    };
  }, [selectedUser, selectedGroup, user]);

  /* ── fetches ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    fetch(`${API}/chats`, { credentials: "include" }).then(r => r.json()).then(d => setPartners(Array.isArray(d) ? d : [])).catch(() => {});
    fetch(`${API}/users`, { credentials: "include" }).then(r => r.json()).then(d => setAllUsers(Array.isArray(d) ? d : [])).catch(() => {});
    fetch(GROUP_API,       { credentials: "include" }).then(r => r.json()).then(d => setGroups(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  /* ── sidebar search ──────────────────────────────────────────────────── */
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); setShowDropdown(false); return; }
    const f = allUsers.filter(u => u._id !== user._id && u?.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    setSearchResults(f); setShowDropdown(true);
  }, [searchQuery, allUsers, user]);

  /* ── auto scroll ─────────────────────────────────────────────────────── */
  useEffect(() => {
    const t = setTimeout(() => {
      if (messagesContainerRef.current)
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }, 50);
    return () => clearTimeout(t);
  }, [messages]);

  /* ── load ────────────────────────────────────────────────────────────── */
  const loadMessages = (u) => {
    if (!u?._id) return;
    setSelectedUser({ ...u, lastSeen: u.lastSeen || null });
    setSelectedGroup(null);
    setMessages([]);
    setMessagesLoading(true);
    fetch(`${API}/${u._id}`, { credentials: "include" })
      .then(r => r.json())
      .then(d => setMessages(Array.isArray(d) ? d : []))
      .catch(() => setMessages([]))
      .finally(() => setMessagesLoading(false));
  };

  const loadGroupMessages = (group) => {
    if (!group?._id) return;
    setSelectedGroup(group);
    setSelectedUser(null);
    setIsTyping(false);
    setMessages([]);
    setMessagesLoading(true);
    fetch(`${GROUP_API}/${group._id}/messages`, { credentials: "include" })
      .then(r => r.json())
      .then(d => setMessages(Array.isArray(d) ? d : []))
      .catch(() => setMessages([]))
      .finally(() => setMessagesLoading(false));
  };

  /* ── FIX 1: image picker ─────────────────────────────────────────────── */
  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result); // base64
    reader.readAsDataURL(file);
    // reset input so the same file can be picked again
    e.target.value = "";
  };

  const clearImage = () => setImagePreview(null);

  /* ── send ────────────────────────────────────────────────────────────── */
  const sendMessage = async () => {
    if (!text.trim() && !imagePreview) return;

    if (selectedGroup?._id) {
      const res = await fetch(`${GROUP_API}/${selectedGroup._id}/send`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, image: imagePreview || undefined }),
      });
      const msg = await res.json();
      setMessages(prev => prev.find(m => m._id === msg._id) ? prev : [...prev, msg]);
      setText(""); clearImage(); return;
    }

    if (!selectedUser?._id) return;

    const res = await fetch(`${API}/send/${selectedUser._id}`, {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, image: imagePreview || undefined }),
    });
    const msg = await res.json();
    socket.emit("send_message", msg);
    setMessages(prev => [...prev, msg]);

    // ── FIX 4: add new partner to sidebar immediately ──────────────────
    setPartners(prev => {
      const u = [...prev];
      const i = u.findIndex(p => p._id.toString() === selectedUser._id.toString());
      if (i !== -1) {
        const [x] = u.splice(i, 1);
        u.unshift(x);
      } else {
        // Brand-new chat partner — add them to the top
        u.unshift(selectedUser);
      }
      return u;
    });

    setText(""); clearImage();
  };

  /* ── FIX 2: leave group ──────────────────────────────────────────────── */
  const leaveGroup = async () => {
    if (!selectedGroup?._id) return;
    const confirmed = window.confirm(`Leave "${selectedGroup.name}"?`);
    if (!confirmed) return;
    try {
      const res = await fetch(`${GROUP_API}/${selectedGroup._id}/leave`, {
        method: "DELETE", credentials: "include",
      });
      if (res.ok) {
        setGroups(prev => prev.filter(g => g._id !== selectedGroup._id));
        setSelectedGroup(null);
        setMessages([]);
      }
    } catch (err) {
      console.error("Failed to leave group:", err);
    }
  };

  /* ── modal ───────────────────────────────────────────────────────────── */
  const toggleUser = (u) =>
    setSelectedUsers(prev => prev.find(x => x._id === u._id) ? prev.filter(x => x._id !== u._id) : [...prev, u]);

  const closeModal = () => { setShowModal(false); setSelectedUsers([]); setGroupName(""); setModalSearch(""); };

  const handleCreateChat = async () => {
    if (selectedUsers.length === 1) {
      loadMessages(selectedUsers[0]);
      // Ensure the partner appears in sidebar immediately (even before a message is sent)
      setPartners(prev =>
        prev.find(p => p._id === selectedUsers[0]._id) ? prev : [selectedUsers[0], ...prev]
      );
    } else if (selectedUsers.length > 1) {
      const finalName = groupName.trim() || selectedUsers.map(u => u.name).join(", ");
      try {
        const res = await fetch(GROUP_API, {
          method: "POST", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: finalName, memberIds: selectedUsers.map(u => u._id) }),
        });
        const group = await res.json();
        setGroups(prev => prev.find(g => g._id === group._id) ? prev : [group, ...prev]);
        loadGroupMessages(group);
      } catch (err) { console.error("Failed to create group:", err); }
    }
    closeModal();
  };

  // ── FIX 3: debounced modal search to reduce re-render lag ─────────────
  const [debouncedModalSearch, setDebouncedModalSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedModalSearch(modalSearch), 120);
    return () => clearTimeout(t);
  }, [modalSearch]);

  const modalUsers = debouncedModalSearch.trim()
    ? allUsers.filter(u => u._id !== user._id && u.name?.toLowerCase().includes(debouncedModalSearch.toLowerCase()))
    : allUsers.filter(u => u._id !== user._id);

  if (!user || !user._id) return <div className="p-5 text-gray-500 text-sm">Loading…</div>;

  const isGroupChat     = !!selectedGroup;
  const activeIsOnline  = !isGroupChat && onlineUsers.includes(selectedUser?._id?.toString());
  const headerName      = isGroupChat ? selectedGroup.name : selectedUser?.name;
  const headerStatus    = isGroupChat
    ? `${selectedGroup.members?.length ?? 0} members`
    : isTyping ? "typing…" : activeIsOnline ? "Online" : "Offline";
  const headerStatusColor = isGroupChat ? "text-indigo-400"
    : isTyping ? "text-blue-500" : activeIsOnline ? "text-emerald-500" : "text-gray-400";

  return (
    <div className="h-screen overflow-hidden flex" style={{ backgroundColor: "#F0F2F5" }}>

      {/* ══ LEFT SIDEBAR ═══════════════════════════════════════════════════ */}
      <div className="w-72 h-full bg-white border-r border-gray-200 flex flex-col shadow-sm">

        {/* Topbar */}
        <div className="px-4 pt-5 pb-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-gray-900">Messages</h1>
            <button
              onClick={() => { setShowModal(true); setModalSearch(""); setSelectedUsers([]); }}
              className="w-8 h-8 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all active:scale-95 shadow-sm"
              title="New Chat"
            >
              <Plus size={15} />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              placeholder="Search conversations…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 focus:bg-white transition"
            />
            {showDropdown && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl max-h-52 overflow-y-auto shadow-xl z-50">
                {searchResults.length > 0 ? searchResults.map(u => (
                  <div
                    key={u._id}
                    onClick={() => {
                      loadMessages(u);
                      // ── FIX 4: also surface them in sidebar immediately ──
                      setPartners(prev =>
                        prev.find(p => p._id === u._id) ? prev : [u, ...prev]
                      );
                      setSearchQuery(""); setShowDropdown(false);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-blue-50 border-b border-gray-50 last:border-0 transition"
                  >
                    <Avatar name={u.name} size="sm" />
                    <span className="text-sm font-medium text-gray-800">{u.name}</span>
                  </div>
                )) : (
                  <div className="px-3 py-3 text-xs text-gray-400 text-center">No users found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: "thin", scrollbarColor: "#E5E7EB transparent" }}>

          {partners.length === 0 && groups.length === 0 && (
            <div className="px-4 py-10 text-center">
              <p className="text-xs text-gray-400">No conversations yet</p>
              <button onClick={() => setShowModal(true)} className="mt-1.5 text-xs text-blue-500 hover:underline font-medium">
                Start one
              </button>
            </div>
          )}

          {partners.map(p => {
            const isOnline = onlineUsers.includes(p?._id?.toString());
            const isActive = !selectedGroup && selectedUser?._id === p?._id;
            return (
              <div
                key={p?._id}
                onClick={() => loadMessages(p)}
                className={`flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl cursor-pointer transition-all ${
                  isActive ? "bg-blue-50 border border-blue-100" : "hover:bg-gray-50"
                }`}
              >
                <div className="relative shrink-0">
                  <Avatar name={p?.name} size="md" />
                  {isOnline && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`block text-sm font-semibold truncate ${isActive ? "text-blue-700" : "text-gray-800"}`}>
                    {p?.name}
                  </span>
                  <span className={`text-xs ${isOnline ? "text-emerald-500" : "text-gray-400"}`}>
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>
                {p?.unreadCount > 0 && (
                  <span className="w-5 h-5 bg-blue-600 text-white text-xs flex items-center justify-center rounded-full font-bold shrink-0">
                    {p.unreadCount}
                  </span>
                )}
              </div>
            );
          })}

          {groups.length > 0 && (
            <>
              <div className="flex items-center gap-1.5 px-5 pt-4 pb-1.5">
                <Users size={11} className="text-gray-400" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Groups</span>
              </div>
              {groups.map(g => {
                const isActive = selectedGroup?._id === g._id;
                return (
                  <div
                    key={g._id}
                    onClick={() => loadGroupMessages(g)}
                    className={`flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl cursor-pointer transition-all ${
                      isActive ? "bg-purple-50 border border-purple-100" : "hover:bg-gray-50"
                    }`}
                  >
                    <Avatar name={g?.name} size="md" gradient="from-purple-500 to-pink-500" />
                    <div className="flex-1 min-w-0">
                      <span className={`block text-sm font-semibold truncate ${isActive ? "text-purple-700" : "text-gray-800"}`}>
                        {g?.name}
                      </span>
                      <span className="text-xs text-gray-400">{g.members?.length ?? 0} members</span>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* ══ CHAT AREA ══════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {(selectedUser || selectedGroup) ? (
          <>
            {/* Header */}
            <div className="h-16 px-5 bg-white border-b border-gray-200 flex items-center gap-3 shadow-sm shrink-0">
              <div className="relative">
                <Avatar
                  name={headerName}
                  size="md"
                  gradient={isGroupChat ? "from-purple-500 to-pink-500" : "from-blue-500 to-indigo-500"}
                />
                {!isGroupChat && activeIsOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 leading-tight">{headerName}</p>
                <p className={`text-xs font-medium ${headerStatusColor}`}>{headerStatus}</p>
              </div>

              {/* ── FIX 2: Leave Group button ────────────────────────────── */}
              {isGroupChat && (
                <button
                  onClick={leaveGroup}
                  title="Leave group"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 border border-red-200 rounded-full hover:bg-red-50 transition-all active:scale-95"
                >
                  <LogOut size={12} />
                  Leave
                </button>
              )}
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-1.5"
              style={{ scrollbarWidth: "thin", scrollbarColor: "#E5E7EB transparent", backgroundColor: "#F8FAFC" }}
            >
              {/* ── Skeleton loader ───────────────────────────────────────── */}
              {messagesLoading && (
                <div className="flex flex-col gap-4 w-full animate-pulse">
                  {/* Received – short */}
                  <div className="flex items-end gap-2 justify-start">
                    <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                    <div className="h-9 w-36 rounded-2xl rounded-bl-sm bg-gray-200" />
                  </div>
                  {/* Sent – medium */}
                  <div className="flex items-end gap-2 justify-end">
                    <div className="h-9 w-52 rounded-2xl rounded-br-sm bg-blue-100" />
                  </div>
                  {/* Received – long */}
                  <div className="flex items-end gap-2 justify-start">
                    <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                    <div className="flex flex-col gap-1.5 items-start">
                      <div className="h-9 w-60 rounded-2xl rounded-bl-sm bg-gray-200" />
                      <div className="h-9 w-40 rounded-2xl rounded-bl-sm bg-gray-200" />
                    </div>
                  </div>
                  {/* Sent – short */}
                  <div className="flex items-end gap-2 justify-end">
                    <div className="h-9 w-28 rounded-2xl rounded-br-sm bg-blue-100" />
                  </div>
                  {/* Received – medium */}
                  <div className="flex items-end gap-2 justify-start">
                    <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                    <div className="h-9 w-44 rounded-2xl rounded-bl-sm bg-gray-200" />
                  </div>
                  {/* Sent – long */}
                  <div className="flex items-end gap-2 justify-end">
                    <div className="flex flex-col gap-1.5 items-end">
                      <div className="h-9 w-56 rounded-2xl rounded-br-sm bg-blue-100" />
                      <div className="h-9 w-36 rounded-2xl rounded-br-sm bg-blue-100" />
                    </div>
                  </div>
                  {/* Received – short */}
                  <div className="flex items-end gap-2 justify-start">
                    <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                    <div className="h-9 w-32 rounded-2xl rounded-bl-sm bg-gray-200" />
                  </div>
                </div>
              )}

              {!messagesLoading && messages.length === 0 && (
                <div className="m-auto text-center">
                  <Avatar
                    name={headerName}
                    size="lg"
                    gradient={isGroupChat ? "from-purple-500 to-pink-500" : "from-blue-500 to-indigo-500"}
                  />
                  <p className="text-sm font-semibold text-gray-700 mt-3">{headerName}</p>
                  <p className="text-xs text-gray-400 mt-1">Send a message to start chatting</p>
                </div>
              )}

              {!messagesLoading && messages.map((m, i) => {
                const senderObj  = typeof m.senderId === "object" ? m.senderId : null;
                const senderId   = senderObj?._id ?? m.senderId;
                const isMe       = senderId?.toString() === user?._id?.toString();
                const senderName = senderObj?.name ?? "";

                return (
                  <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2`}>
                    {!isMe && isGroupChat && (
                      <Avatar name={senderName || "?"} size="sm" gradient="from-gray-300 to-gray-400" />
                    )}
                    <div className={`flex flex-col max-w-[60%] ${isMe ? "items-end" : "items-start"}`}>
                      {isGroupChat && !isMe && senderName && (
                        <span className="text-xs text-gray-500 font-medium mb-1 ml-1">{senderName}</span>
                      )}

                      {/* ── FIX 1: render image if present ──────────────── */}
                      {m?.image && (
                        <img
                          src={m.image}
                          alt="attachment"
                          className={`max-w-xs rounded-2xl mb-1 shadow-sm object-cover ${isMe ? "rounded-br-sm" : "rounded-bl-sm"}`}
                          style={{ maxHeight: 260 }}
                        />
                      )}

                      {m?.text && (
                        <div className={`px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                          isMe
                            ? "bg-blue-600 text-white rounded-2xl rounded-br-sm"
                            : "bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-sm"
                        }`}>
                          {m.text}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input area */}
            <div className="px-5 py-3 bg-white border-t border-gray-200 shrink-0">

              {/* ── FIX 1: image preview strip ──────────────────────────── */}
              {imagePreview && (
                <div className="mb-2 flex items-start gap-2">
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="h-20 w-20 object-cover rounded-xl border border-gray-200 shadow-sm"
                    />
                    <button
                      onClick={clearImage}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                    >
                      <X size={10} />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                {/* ── FIX 1: image pick button ──────────────────────────── */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach image"
                  className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all shrink-0"
                >
                  <Image size={18} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImagePick}
                />

                <input
                  value={text}
                  onChange={e => {
                    setText(e.target.value);
                    if (!isGroupChat && selectedUser)
                      socket.emit("typing", { to: selectedUser._id, from: user._id });
                  }}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  placeholder={`Message ${headerName ?? ""}…`}
                  className="flex-1 px-4 py-2.5 text-sm rounded-full border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 focus:bg-white transition"
                />
                <button
                  onClick={sendMessage}
                  disabled={!text.trim() && !imagePreview}
                  className="w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full transition-all active:scale-95 shadow-sm shrink-0"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="m-auto text-center px-6">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
              <Send size={22} className="text-blue-400" />
            </div>
            <p className="text-gray-700 font-semibold text-sm">Your messages</p>
            <p className="text-xs text-gray-400 mt-1">Select a chat or start a new one</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 transition"
            >
              New Chat
            </button>
          </div>
        )}
      </div>

      {/* ══ NEW CHAT MODAL ═════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">

            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-sm font-bold text-gray-900">New Conversation</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {selectedUsers.length === 0 ? "Select people to message" : `${selectedUsers.length} selected`}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
              >
                <X size={14} />
              </button>
            </div>

            {/* Selected chips */}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-5 pt-3">
                {selectedUsers.map(u => (
                  <span
                    key={u._id}
                    onClick={() => toggleUser(u)}
                    className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer hover:bg-blue-200 transition"
                  >
                    {u.name} <X size={9} />
                  </span>
                ))}
              </div>
            )}

            {/* Search */}
            <div className="px-5 pt-3 pb-2">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  autoFocus
                  value={modalSearch}
                  onChange={e => setModalSearch(e.target.value)}
                  placeholder="Search people…"
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 focus:bg-white transition"
                />
              </div>
            </div>

            {/* ── FIX 3: smoother scroll — will-change + overscroll-contain ── */}
            <div
              className="overflow-y-auto px-3 pb-2"
              style={{
                maxHeight: "13rem",
                scrollbarWidth: "thin",
                overscrollBehavior: "contain",
                willChange: "scroll-position",
              }}
            >
              {modalUsers.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No users found</p>
              ) : modalUsers.map(u => {
                const isSelected = !!selectedUsers.find(x => x._id === u._id);
                return (
                  <div
                    key={u._id}
                    onClick={() => toggleUser(u)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                      isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <Avatar name={u.name} size="sm" />
                    <span className={`flex-1 text-sm font-medium ${isSelected ? "text-blue-700" : "text-gray-800"}`}>
                      {u.name}
                    </span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300"
                    }`}>
                      {isSelected && <Check size={10} color="white" strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Group name */}
            {selectedUsers.length > 1 && (
              <div className="px-5 pb-2">
                <input
                  placeholder="Group name (optional)"
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>
            )}

            {/* Footer */}
            <div className="flex gap-2 px-5 py-4 border-t border-gray-100">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateChat}
                disabled={selectedUsers.length === 0}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {selectedUsers.length > 1 ? "Create Group" : "Start Chat"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}