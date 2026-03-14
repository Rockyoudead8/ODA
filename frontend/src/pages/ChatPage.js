import { useState } from "react";
import ChatSidebar from "../components/ChatSidebar.js";
import ChatHeader from "../components/ChatHeader";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import { users, messages as initialMessages } from "../data/dummyData";

export default function ChatPage() {

  const [selectedUser, setSelectedUser] = useState(users[0]);
  const [messages, setMessages] = useState(initialMessages);
  const [typing, setTyping] = useState(false);

  const handleSend = (text) => {
    const newMsg = {
      id: Date.now(),
      sender: "me",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages([...messages, newMsg]);
  };

  return (
    <div className="h-screen flex bg-gray-100">

      <ChatSidebar
        users={users}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
      />

      <div className="flex flex-col flex-1">

        <ChatHeader user={selectedUser} />

        <MessageList
          messages={messages}
          typing={typing}
        />

        <MessageInput onSend={handleSend} />

      </div>
    </div>
  );
}