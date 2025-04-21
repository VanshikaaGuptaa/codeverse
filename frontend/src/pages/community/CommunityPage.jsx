import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-hot-toast";

const CommunityPage = () => {
  const [tag, setTag] = useState("");
  const [searchTag, setSearchTag] = useState("");
  const [answers, setAnswers] = useState({}); // to hold answers per question

  const { data: questions, refetch } = useQuery({
    queryKey: ["community", searchTag],
    queryFn: async () => {
      const res = await fetch(`/api/community/search?query=${searchTag}`);
      const data = await res.json();
      return data;
    },
    enabled: false,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTag(tag.trim().toLowerCase());
    refetch();
  };

  const answerMutation = useMutation({
    mutationFn: async ({ questionId, text }) => {
      const res = await fetch(`/api/community/answer/${questionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post answer");
      return data;
    },
    onSuccess: () => {
      toast.success("Answer posted");
      setAnswers({});
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleAnswerSubmit = (questionId) => {
    const text = answers[questionId];
    if (!text?.trim()) return;
    answerMutation.mutate({ questionId, text });
  };

  return (
    <div className='p-4 min-h-screen relative'>
      {/* Search Box */}
      <form className='mb-4 flex gap-2' onSubmit={handleSearch}>
        <input
          type='text'
          className='input border border-gray-700 w-full'
          placeholder='Search tag...'
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        />
        <button className='btn btn-primary'>Search</button>
      </form>

      {/* Questions List */}
      {questions?.map((q) => (
        <div key={q._id} className='p-4 border border-gray-700 rounded mb-4'>
          <p className='font-bold mb-2'>{q.question}</p>

          <div className='mb-2 flex gap-2 flex-wrap'>
            {q.tags.map((tag, i) => (
              <span key={i} className='bg-gray-800 text-white px-2 py-1 rounded text-xs'>
                #{tag}
              </span>
            ))}
          </div>

          <p className='text-sm mb-1 text-slate-400'>Answers:</p>
          {q.answers.length === 0 && (
            <p className='ml-2 text-xs text-slate-500'>No answers yet. Be the first to reply!</p>
          )}
          {q.answers.map((ans, i) => (
            <div key={i} className='ml-2 mb-1'>
              <strong>@{ans.user?.username || "User"}</strong>: {ans.text}
            </div>
          ))}

          {/* Answer Input Box */}
          <div className='mt-3 flex gap-2'>
            <input
              type='text'
              className='input input-sm w-full border border-gray-600'
              placeholder='Your answer...'
              value={answers[q._id] || ""}
              onChange={(e) => setAnswers({ ...answers, [q._id]: e.target.value })}
            />
            <button
              className='btn btn-sm btn-primary'
              onClick={() => handleAnswerSubmit(q._id)}
              disabled={answerMutation.isPending}
            >
              {answerMutation.isPending ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      ))}

      {/* Floating Ask Button */}
      <button
        className='fixed bottom-6 right-6 btn btn-primary rounded-full'
        onClick={() => document.getElementById("ask_modal").showModal()}
      >
        <FaPlus className='text-white' />
      </button>

      {/* Ask Modal */}
      <dialog id='ask_modal' className='modal'>
        <div className='modal-box'>
          <AskQuestionModal onClose={() => document.getElementById("ask_modal").close()} refetch={refetch} />
        </div>
        <form method='dialog' className='modal-backdrop'>
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

const AskQuestionModal = ({ onClose, refetch }) => {
  const [question, setQuestion] = useState("");
  const [tags, setTags] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/community/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          tags: tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to ask");
      return data;
    },
    onSuccess: () => {
      toast.success("Question posted");
      onClose();
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });


  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutate();
      }}
      className='flex flex-col gap-3'
    >
      <h3 className='text-lg font-bold'>Ask a question</h3>
      <textarea
        className='textarea border border-gray-700'
        placeholder='Your question...'
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        required
      />
      <input
        className='input border border-gray-700'
        placeholder='Tags (comma separated)'
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />
      <button className='btn btn-primary'>{isPending ? "Posting..." : "Post"}</button>
    </form>
  );
};

export default CommunityPage;
