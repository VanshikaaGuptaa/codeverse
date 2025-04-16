import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Post from "../../components/common/Post";
import PostSkeleton from "../../components/skeletons/PostSkeleton";

const SearchPage = () => {
  const [tag, setTag] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: posts,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["search", tag],
    queryFn: async () => {
      const res = await fetch(`/api/posts/search?tag=${tag}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to search posts");
      return data;
    },
    enabled: false,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setTag(searchTerm.trim().toLowerCase());
    refetch();
  };

  return (
    <div className='flex-[4_4_0] border-l border-r border-gray-700 min-h-screen p-4'>
      <h2 className='text-xl font-bold mb-4'>Search by Tag</h2>
      <form className='flex gap-2 mb-4' onSubmit={handleSearch}>
        <input
          type='text'
          placeholder='e.g. react'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='input w-full border border-gray-700 rounded p-2'
        />
        <button className='btn btn-primary rounded'>Search</button>
      </form>

      {isLoading && (
        <>
          <PostSkeleton />
          <PostSkeleton />
        </>
      )}

      {!isLoading && posts?.length === 0 && (
        <p className='text-center mt-4 text-gray-500'>No posts found for that tag.</p>
      )}

      {!isLoading && posts?.map((post) => <Post key={post._id} post={post} />)}
    </div>
  );
};

export default SearchPage;
