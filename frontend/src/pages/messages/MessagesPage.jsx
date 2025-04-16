import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

const MessagesPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      const res = await fetch("/api/messages");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load messages");
      return data;
    },
  });

  if (isLoading) return <p className='p-4'>Loading messages...</p>;

  return (
    <div className='p-4'>
      <h2 className='text-xl font-bold mb-4'>Messages</h2>
      {data.length === 0 ? (
        <p>No messages yet</p>
      ) : (
        <ul className='space-y-3'>
          {data.map((msg) => (
            <li key={msg._id} className='border-b border-gray-600 pb-2'>
              <span className='text-sm text-gray-400'>
                From: @{msg.from.username} → @{msg.to.username}
              </span>
              <p>{msg.text}</p>
              {!msg.approved && msg.to._id === msg.from._id && (
                <button className='btn btn-xs btn-primary mt-1'>Approve</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MessagesPage;
