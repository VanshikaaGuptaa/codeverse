import { useState } from "react";
import { toast } from "react-hot-toast";

const MessagePopup = ({ toUser, onClose }) => {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!text.trim()) return;

    setSending(true);
    try {
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: toUser._id, text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Message sent");
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-5 w-96">
        <h2 className="text-lg font-bold mb-2">Message @{toUser.username}</h2>
        <textarea
          rows="4"
          className="w-full p-2 border border-gray-600 rounded"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message..."
        />
        <div className="flex justify-end mt-2 gap-2">
          <button onClick={onClose} className="btn btn-sm">Cancel</button>
          <button
            onClick={handleSend}
            className="btn btn-sm btn-primary"
            disabled={sending}
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagePopup;
