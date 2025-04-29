import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";

const ChatPage = () => {
  const { chatId } = useParams();
  const [text, setText] = useState("");

  const { data: messages = [] } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const res = await fetch(`/api/messages/chat/${chatId}`);
      return await res.json();
    }
  });

  const { mutate: sendMessage } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/messages/chat/${chatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      return await res.json();
    },
    onSuccess: () => setText("")
  });

  return (
    <div className='p-4'>
      <div className='mb-4'>
        {messages.map((msg) => (
          <div key={msg._id} className='mb-2'>
            <strong>@{msg.sender.username}</strong>: {msg.text}
          </div>
        ))}
      </div>
      <form
        className='flex gap-2'
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <input
          type='text'
          value={text}
          onChange={(e) => setText(e.target.value)}
          className='input w-full border border-gray-700'
        />
        <button className='btn btn-primary'>Send</button>
      </form>
    </div>
  );
};

export default ChatPage;
