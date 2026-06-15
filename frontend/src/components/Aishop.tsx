import { useState } from "react";
import { Send } from "lucide-react";
export default function ChatInput() {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    console.log("Send:", text);
    setText("");
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-sm px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400 transition">
        {/* Send Icon LEFT */}
        <button
          onClick={handleSend}
          className="text-gray-500 hover:text-blue-600 p-2"
        >
          <Send size={18} />
        </button>

        {/* Input */}
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask something..."
          className="flex-1 px-2 outline-none text-sm"
        />
      </div>
    </div>
  );
}
