import { useEffect, useRef } from "react";

export default function MessageList({ messages, typing }) {
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-3">

      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${
            msg.sender === "me" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`px-4 py-2 rounded-lg max-w-xs ${
              msg.sender === "me"
                ? "bg-green-500 text-white"
                : "bg-white border"
            }`}
          >
            <div>{msg.text}</div>
            <div className="text-xs text-gray-300 mt-1">{msg.time}</div>
          </div>
        </div>
      ))}

      {typing && (
        <div className="text-sm text-gray-400">
          typing...
        </div>
      )}

      <div ref={bottomRef}></div>
    </div>
  );
}