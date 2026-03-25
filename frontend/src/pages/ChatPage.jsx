import React, { useEffect, useState, useRef, useContext } from "react";
import { socket } from "../utils/socket";
import { UserContext } from "../UserContext";
import { Search, Plus, Send, Users, X, Check, Image, LogOut, Loader2 } from "lucide-react";

const API       = "http://localhost:8000/api/messages";
const GROUP_API = "http://localhost:8000/api/groups";

function Avatar({ name, photoUrl, size = "md", gradient = "from-violet-600 to-indigo-600" }) {
  const sz = size === "sm" ? "w-8 h-8 text-xs" : size === "lg" ? "w-12 h-12 text-base" : "w-9 h-9 text-sm";
  if (photoUrl) return <img src={photoUrl} alt={name || "avatar"} className={`${sz} rounded-full object-cover shrink-0 border border-zinc-600/50`} onError={(e) => { e.target.style.display = "none"; }} />;
  return <div className={`${sz} rounded-full bg-gradient-to-br ${gradient} text-white flex items-center justify-center font-bold shrink-0`}>{name?.charAt(0).toUpperCase() ?? "?"}</div>;
}

export default function ChatPage() {
  // Use context instead of prop — no prop drilling needed
  const { user } = useContext(UserContext);

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
  const [imagePreview,  setImagePreview]  = useState(null);
  const [imageSending,  setImageSending]  = useState(false);
  // Mobile: toggle sidebar visibility
  const [showSidebar,   setShowSidebar]   = useState(true);

  const fileInputRef          = useRef(null);
  const messagesContainerRef  = useRef(null);
  const selectedGroupRef      = useRef(null);
  const selectedUserRef       = useRef(null);

  useEffect(() => { selectedGroupRef.current = selectedGroup; }, [selectedGroup]);
  useEffect(() => { selectedUserRef.current  = selectedUser;  }, [selectedUser]);

  useEffect(() => { socket.connect(); return () => socket.disconnect(); }, []);

  useEffect(() => {
    if (!user) return;
    const handleOnline = (users) => setOnlineUsers(users);

    const handleMessage = (msg) => {
      const curSel  = selectedUserRef.current;
      const otherId = msg.senderId?.toString() === user._id?.toString() ? msg.receiverId : msg.senderId;
      if (
        (msg.senderId?.toString()   === curSel?._id?.toString() && msg.receiverId?.toString() === user._id?.toString()) ||
        (msg.receiverId?.toString() === curSel?._id?.toString() && msg.senderId?.toString()   === user._id?.toString())
      ) setMessages(prev => [...prev, msg]);
      setPartners(prev => {
        const u = [...prev];
        const i = u.findIndex(p => p._id.toString() === otherId?.toString());
        if (i !== -1) { const [x] = u.splice(i, 1); u.unshift(x); }
        return u;
      });
    };

    const handleGroupMessage = (msg) => {
      const curGroup = selectedGroupRef.current;
      if (msg.groupId?.toString() === curGroup?._id?.toString()) {
        setMessages(prev =>
          prev.find(m => m._id?.toString() === msg._id?.toString()) ? prev : [...prev, msg]
        );
      }
      setGroups(prev => {
        const g = [...prev];
        const i = g.findIndex(x => x._id.toString() === msg.groupId?.toString());
        if (i !== -1) { const [x] = g.splice(i, 1); g.unshift(x); }
        return g;
      });
    };

    const handleNewGroup    = (group) => setGroups(prev => prev.find(g => g._id === group._id) ? prev : [group, ...prev]);
    const handleTyping      = ({ from }) => {
      if (from === selectedUserRef.current?._id) { setIsTyping(true); setTimeout(() => setIsTyping(false), 1500); }
    };
    const handleGroupMemberLeft = ({ groupId, userId: leftId }) => {
      if (leftId === user._id?.toString()) {
        setGroups(prev => prev.filter(g => g._id.toString() !== groupId));
        setSelectedGroup(prev => prev?._id?.toString() === groupId ? null : prev);
        if (selectedGroupRef.current?._id?.toString() === groupId) setMessages([]);
      } else {
        setGroups(prev => prev.map(g =>
          g._id.toString() === groupId ? { ...g, members: g.members.filter(m => m.toString() !== leftId) } : g
        ));
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    fetch(`${API}/chats`, { credentials: "include" }).then(r => r.json()).then(d => setPartners(Array.isArray(d) ? d : [])).catch(() => {});
    fetch(`${API}/users`, { credentials: "include" }).then(r => r.json()).then(d => setAllUsers(Array.isArray(d) ? d : [])).catch(() => {});
    fetch(GROUP_API,       { credentials: "include" }).then(r => r.json()).then(d => setGroups(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); setShowDropdown(false); return; }
    const f = allUsers.filter(u => u._id !== user?._id && u?.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    setSearchResults(f); setShowDropdown(true);
  }, [searchQuery, allUsers, user]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (messagesContainerRef.current)
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }, 50);
    return () => clearTimeout(t);
  }, [messages]);

  const loadMessages = (u) => {
    if (!u?._id) return;
    setSelectedUser({ ...u, lastSeen: u.lastSeen || null });
    setSelectedGroup(null);
    setMessages([]); setMessagesLoading(true);
    setShowSidebar(false); // hide sidebar on mobile when chat opens
    fetch(`${API}/${u._id}`, { credentials: "include" })
      .then(r => r.json()).then(d => setMessages(Array.isArray(d) ? d : []))
      .catch(() => setMessages([])).finally(() => setMessagesLoading(false));
  };

  const loadGroupMessages = (group) => {
    if (!group?._id) return;
    setSelectedGroup(group); setSelectedUser(null); setIsTyping(false);
    setMessages([]); setMessagesLoading(true);
    setShowSidebar(false); // hide sidebar on mobile when chat opens
    fetch(`${GROUP_API}/${group._id}/messages`, { credentials: "include" })
      .then(r => r.json()).then(d => setMessages(Array.isArray(d) ? d : []))
      .catch(() => setMessages([])).finally(() => setMessagesLoading(false));
  };

  const handleImagePick = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file); e.target.value = "";
  };

  const clearImage = () => setImagePreview(null);

  const sendMessage = async () => {
    if (!text.trim() && !imagePreview) return;
    if (imageSending) return;
    const hasImage = !!imagePreview;
    if (hasImage) setImageSending(true);
    try {
      if (selectedGroup?._id) {
        const res = await fetch(`${GROUP_API}/${selectedGroup._id}/send`, {
          method: "POST", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, image: imagePreview || undefined }),
        });
        const msg = await res.json();
        if (msg?._id) {
          setMessages(prev =>
            prev.find(m => m._id?.toString() === msg._id?.toString()) ? prev : [...prev, msg]
          );
          setGroups(prev => {
            const g = [...prev];
            const i = g.findIndex(x => x._id.toString() === selectedGroup._id.toString());
            if (i !== -1) { const [x] = g.splice(i, 1); g.unshift(x); }
            return g;
          });
        }
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
      setPartners(prev => {
        const u = [...prev];
        const i = u.findIndex(p => p._id.toString() === selectedUser._id.toString());
        if (i !== -1) { const [x] = u.splice(i, 1); u.unshift(x); } else u.unshift(selectedUser);
        return u;
      });
      setText(""); clearImage();
    } finally {
      if (hasImage) setImageSending(false);
    }
  };

  const leaveGroup = async () => {
    if (!selectedGroup?._id) return;
    if (!window.confirm(`Leave "${selectedGroup.name}"?`)) return;
    try {
      const res = await fetch(`${GROUP_API}/${selectedGroup._id}/leave`, { method: "DELETE", credentials: "include" });
      if (res.ok) { setGroups(prev => prev.filter(g => g._id !== selectedGroup._id)); setSelectedGroup(null); setMessages([]); setShowSidebar(true); }
    } catch (err) { console.error("Failed to leave group:", err); }
  };

  const toggleUser  = (u) => setSelectedUsers(prev => prev.find(x => x._id === u._id) ? prev.filter(x => x._id !== u._id) : [...prev, u]);
  const closeModal  = () => { setShowModal(false); setSelectedUsers([]); setGroupName(""); setModalSearch(""); };

  const handleCreateChat = async () => {
    if (selectedUsers.length === 1) {
      loadMessages(selectedUsers[0]);
      setPartners(prev => prev.find(p => p._id === selectedUsers[0]._id) ? prev : [selectedUsers[0], ...prev]);
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

  const [debouncedModalSearch, setDebouncedModalSearch] = useState("");
  useEffect(() => { const t = setTimeout(() => setDebouncedModalSearch(modalSearch), 120); return () => clearTimeout(t); }, [modalSearch]);

  const modalUsers = debouncedModalSearch.trim()
    ? allUsers.filter(u => u._id !== user?._id && u.name?.toLowerCase().includes(debouncedModalSearch.toLowerCase()))
    : allUsers.filter(u => u._id !== user?._id);

  if (!user || !user._id) return (
    <div className="p-5 text-zinc-500 text-sm bg-zinc-900 min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-violet-400 mr-2" size={18} /> Loading…
    </div>
  );

  const isGroupChat       = !!selectedGroup;
  const activeIsOnline    = !isGroupChat && onlineUsers.includes(selectedUser?._id?.toString());
  const headerName        = isGroupChat ? selectedGroup.name : selectedUser?.name;
  const headerStatus      = isGroupChat ? `${selectedGroup.members?.length ?? 0} members` : isTyping ? "typing…" : activeIsOnline ? "Online" : "Offline";
  const headerStatusColor = isGroupChat ? "text-violet-400" : isTyping ? "text-blue-400" : activeIsOnline ? "text-emerald-400" : "text-zinc-500";

  return (
    <div className="h-[calc(100vh-57px)] overflow-hidden flex bg-zinc-900">

      {/* SIDEBAR — on mobile: full width overlay when shown */}
      <div className={`
        flex flex-col bg-zinc-900 border-r border-zinc-800 shadow-xl shrink-0
        w-full sm:w-72 h-full
        ${showSidebar ? "flex" : "hidden sm:flex"}
        absolute sm:relative inset-0 sm:inset-auto z-20 sm:z-auto
      `}>
        <div className="px-4 pt-5 pb-3 border-b border-zinc-800 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-base font-bold text-zinc-100">Messages</h1>
            <button
              onClick={() => { setShowModal(true); setModalSearch(""); setSelectedUsers([]); }}
              className="w-8 h-8 flex items-center justify-center bg-violet-600 hover:bg-violet-500 text-white rounded-full transition-all active:scale-95 shadow-sm"
            ><Plus size={15} /></button>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input
              placeholder="Search conversations…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-600 transition"
            />
            {showDropdown && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-zinc-800 border border-zinc-700 rounded-xl max-h-52 overflow-y-auto shadow-2xl z-50">
                {searchResults.length > 0 ? searchResults.map(u => (
                  <div key={u._id} onClick={() => { loadMessages(u); setPartners(prev => prev.find(p => p._id === u._id) ? prev : [u, ...prev]); setSearchQuery(""); setShowDropdown(false); }}
                    className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-zinc-700 border-b border-zinc-700/50 last:border-0 transition">
                    <Avatar name={u.name} photoUrl={u.profilePhoto} size="sm" />
                    <span className="text-sm font-medium text-zinc-200">{u.name}</span>
                  </div>
                )) : <div className="px-3 py-3 text-xs text-zinc-500 text-center">No users found</div>}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: "thin", scrollbarColor: "#3f3f46 transparent" }}>
          {partners.length === 0 && groups.length === 0 && (
            <div className="px-4 py-10 text-center">
              <p className="text-xs text-zinc-500">No conversations yet</p>
              <button onClick={() => setShowModal(true)} className="mt-1.5 text-xs text-violet-400 hover:text-violet-300 font-medium transition">Start one</button>
            </div>
          )}
          {partners.map(p => {
            const isOnline = onlineUsers.includes(p?._id?.toString());
            const isActive = !selectedGroup && selectedUser?._id === p?._id;
            return (
              <div key={p?._id} onClick={() => loadMessages(p)}
                className={`flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl cursor-pointer transition-all ${isActive ? "bg-violet-900/40 border border-violet-800/50" : "hover:bg-zinc-800"}`}>
                <div className="relative shrink-0">
                  <Avatar name={p?.name} photoUrl={p?.profilePhoto} size="md" />
                  {isOnline && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-zinc-900 rounded-full" />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`block text-sm font-semibold truncate ${isActive ? "text-violet-300" : "text-zinc-200"}`}>{p?.name}</span>
                  <span className={`text-xs ${isOnline ? "text-emerald-400" : "text-zinc-500"}`}>{isOnline ? "Online" : "Offline"}</span>
                </div>
              </div>
            );
          })}
          {groups.length > 0 && (
            <>
              <div className="flex items-center gap-1.5 px-5 pt-4 pb-1.5">
                <Users size={11} className="text-zinc-500" />
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Groups</span>
              </div>
              {groups.map(g => {
                const isActive = selectedGroup?._id === g._id;
                return (
                  <div key={g._id} onClick={() => loadGroupMessages(g)}
                    className={`flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl cursor-pointer transition-all ${isActive ? "bg-violet-900/40 border border-violet-800/50" : "hover:bg-zinc-800"}`}>
                    <Avatar name={g?.name} size="md" gradient="from-violet-600 to-pink-600" />
                    <div className="flex-1 min-w-0">
                      <span className={`block text-sm font-semibold truncate ${isActive ? "text-violet-300" : "text-zinc-200"}`}>{g?.name}</span>
                      <span className="text-xs text-zinc-500">{g.members?.length ?? 0} members</span>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className={`flex-1 flex flex-col h-full overflow-hidden bg-zinc-900 ${showSidebar ? "hidden sm:flex" : "flex"}`}>
        {(selectedUser || selectedGroup) ? (
          <>
            {/* Header */}
            <div className="h-16 px-4 sm:px-5 bg-zinc-800/80 border-b border-zinc-700/60 flex items-center gap-3 shrink-0 backdrop-blur-sm">
              {/* Back button on mobile */}
              <button
                className="sm:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 transition mr-1"
                onClick={() => setShowSidebar(true)}
                aria-label="Back to conversations"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <div className="relative">
                <Avatar name={headerName} photoUrl={!isGroupChat ? selectedUser?.profilePhoto : null} size="md"
                  gradient={isGroupChat ? "from-violet-600 to-pink-600" : "from-violet-600 to-indigo-600"} />
                {!isGroupChat && activeIsOnline && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-zinc-800 rounded-full" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-zinc-100 leading-tight truncate">{headerName}</p>
                <p className={`text-xs font-medium ${headerStatusColor}`}>{headerStatus}</p>
              </div>
              {isGroupChat && (
                <button onClick={leaveGroup} title="Leave group"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-400 border border-red-800/50 rounded-full hover:bg-red-900/20 transition-all active:scale-95">
                  <LogOut size={12} /> <span className="hidden sm:inline">Leave</span>
                </button>
              )}
            </div>

            {/* Messages */}
            <div ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 flex flex-col gap-1.5 bg-zinc-900"
              style={{ scrollbarWidth: "thin", scrollbarColor: "#3f3f46 transparent" }}>
              {messagesLoading && (
                <div className="flex flex-col gap-4 w-full animate-pulse">
                  <div className="flex items-end gap-2 justify-start"><div className="w-8 h-8 rounded-full bg-zinc-700 shrink-0" /><div className="h-9 w-36 rounded-2xl rounded-bl-sm bg-zinc-800" /></div>
                  <div className="flex items-end gap-2 justify-end"><div className="h-9 w-52 rounded-2xl rounded-br-sm bg-violet-900/50" /></div>
                </div>
              )}
              {!messagesLoading && messages.length === 0 && (
                <div className="m-auto text-center">
                  <Avatar name={headerName} photoUrl={!isGroupChat ? selectedUser?.profilePhoto : null} size="lg"
                    gradient={isGroupChat ? "from-violet-600 to-pink-600" : "from-violet-600 to-indigo-600"} />
                  <p className="text-sm font-semibold text-zinc-300 mt-3">{headerName}</p>
                  <p className="text-xs text-zinc-500 mt-1">Send a message to start chatting</p>
                </div>
              )}
              {!messagesLoading && messages.map((m, i) => {
                const senderObj   = typeof m.senderId === "object" ? m.senderId : null;
                const senderId    = senderObj?._id ?? m.senderId;
                const isMe        = senderId?.toString() === user?._id?.toString();
                const senderName  = senderObj?.name ?? "";
                const senderPhoto = senderObj?.profilePhoto ?? null;
                return (
                  <div key={m._id ?? i} className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2`}>
                    {!isMe && isGroupChat && <Avatar name={senderName || "?"} photoUrl={senderPhoto} size="sm" gradient="from-zinc-600 to-zinc-500" />}
                    <div className={`flex flex-col max-w-[75%] sm:max-w-[60%] ${isMe ? "items-end" : "items-start"}`}>
                      {isGroupChat && !isMe && senderName && <span className="text-xs text-zinc-500 font-medium mb-1 ml-1">{senderName}</span>}
                      {m?.image && <img src={m.image} alt="attachment" className={`max-w-full rounded-2xl mb-1 shadow-sm object-cover border border-zinc-700/50 ${isMe ? "rounded-br-sm" : "rounded-bl-sm"}`} style={{ maxHeight: 260 }} />}
                      {m?.text && <div className={`px-4 py-2.5 text-sm leading-relaxed shadow-sm break-words ${isMe ? "bg-violet-700 text-white rounded-2xl rounded-br-sm" : "bg-zinc-800 text-zinc-200 border border-zinc-700/60 rounded-2xl rounded-bl-sm"}`}>{m.text}</div>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <div className="px-4 sm:px-5 py-3 bg-zinc-800/80 border-t border-zinc-700/60 shrink-0 backdrop-blur-sm">
              {imagePreview && (
                <div className="mb-2 flex items-start gap-2">
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="preview" className="h-20 w-20 object-cover rounded-xl border border-zinc-600 shadow-sm" />
                    <button onClick={clearImage} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition"><X size={10} /></button>
                  </div>
                  {imageSending && <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1"><Loader2 size={12} className="animate-spin text-violet-400" />Uploading…</div>}
                </div>
              )}
              <div className="flex items-center gap-2 sm:gap-3">
                <button onClick={() => !imageSending && fileInputRef.current?.click()} disabled={imageSending}
                  className={`w-9 h-9 flex items-center justify-center rounded-full transition-all shrink-0 ${imageSending ? "text-zinc-600 cursor-not-allowed" : "text-zinc-400 hover:text-violet-400 hover:bg-violet-900/30"}`}>
                  {imageSending ? <Loader2 size={18} className="animate-spin" /> : <Image size={18} />}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
                <input
                  value={text}
                  onChange={e => { setText(e.target.value); if (!isGroupChat && selectedUser) socket.emit("typing", { to: selectedUser._id, from: user._id }); }}
                  onKeyDown={e => e.key === "Enter" && !imageSending && sendMessage()}
                  placeholder={`Message ${headerName ?? ""}…`}
                  className="flex-1 px-4 py-2.5 text-sm rounded-full border border-zinc-700 bg-zinc-700/50 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-600 transition"
                />
                <button onClick={sendMessage} disabled={(!text.trim() && !imagePreview) || imageSending}
                  className="w-10 h-10 flex items-center justify-center bg-violet-700 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full transition-all active:scale-95 shadow-sm shrink-0">
                  {imageSending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="m-auto text-center px-6">
            <div className="w-14 h-14 rounded-full bg-violet-900/30 flex items-center justify-center mx-auto mb-3 border border-violet-800/40">
              <Send size={22} className="text-violet-400" />
            </div>
            <p className="text-zinc-300 font-semibold text-sm">Your messages</p>
            <p className="text-xs text-zinc-500 mt-1">Select a chat or start a new one</p>
            <button onClick={() => setShowModal(true)} className="mt-4 px-5 py-2 bg-violet-700 text-white text-sm font-semibold rounded-full hover:bg-violet-600 transition">New Chat</button>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-zinc-800 border border-zinc-700 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-700">
              <div>
                <h2 className="text-sm font-bold text-zinc-100">New Conversation</h2>
                <p className="text-xs text-zinc-500 mt-0.5">{selectedUsers.length === 0 ? "Select people to message" : `${selectedUsers.length} selected`}</p>
              </div>
              <button onClick={closeModal} className="w-7 h-7 flex items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition"><X size={14} /></button>
            </div>
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-5 pt-3">
                {selectedUsers.map(u => (
                  <span key={u._id} onClick={() => toggleUser(u)}
                    className="flex items-center gap-1 bg-violet-900/50 text-violet-300 border border-violet-800/50 text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer hover:bg-violet-900 transition">
                    {u.name} <X size={9} />
                  </span>
                ))}
              </div>
            )}
            <div className="px-5 pt-3 pb-2">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                <input autoFocus value={modalSearch} onChange={e => setModalSearch(e.target.value)} placeholder="Search people…"
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-zinc-700 bg-zinc-700/50 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-600 transition" />
              </div>
            </div>
            <div className="overflow-y-auto px-3 pb-2" style={{ maxHeight: "13rem", scrollbarWidth: "thin" }}>
              {modalUsers.length === 0
                ? <p className="text-xs text-zinc-500 text-center py-6">No users found</p>
                : modalUsers.map(u => {
                    const isSelected = !!selectedUsers.find(x => x._id === u._id);
                    return (
                      <div key={u._id} onClick={() => toggleUser(u)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${isSelected ? "bg-violet-900/40" : "hover:bg-zinc-700"}`}>
                        <Avatar name={u.name} photoUrl={u.profilePhoto} size="sm" />
                        <span className={`flex-1 text-sm font-medium ${isSelected ? "text-violet-300" : "text-zinc-200"}`}>{u.name}</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? "bg-violet-600 border-violet-600" : "border-zinc-600"}`}>
                          {isSelected && <Check size={10} color="white" strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })
              }
            </div>
            {selectedUsers.length > 1 && (
              <div className="px-5 pb-2">
                <input placeholder="Group name (optional)" value={groupName} onChange={e => setGroupName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-700 bg-zinc-700/50 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition" />
              </div>
            )}
            <div className="flex gap-2 px-5 py-4 border-t border-zinc-700">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-zinc-300 bg-zinc-700 hover:bg-zinc-600 transition">Cancel</button>
              <button onClick={handleCreateChat} disabled={selectedUsers.length === 0}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-violet-700 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition">
                {selectedUsers.length > 1 ? "Create Group" : "Start Chat"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}