import { useState } from "react";
import { Send, Smile, Paperclip } from "lucide-react";

export default function MessageInput({ onSend }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;

    onSend(text);
    setText("");
  };

  return (
    <div className="h-16 border-t bg-white flex items-center px-4 gap-3">

      <Smile className="cursor-pointer" />

      <Paperclip className="cursor-pointer" />

      <input
        className="flex-1 border rounded-lg px-3 py-2 outline-none"
        placeholder="Type message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={handleSend}
        className="bg-green-500 text-white p-2 rounded-lg"
      >
        <Send size={18} />
      </button>
    </div>
  );
}