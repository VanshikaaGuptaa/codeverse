import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useRef, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const CreatePost = () => {
  const [text, setText] = useState("");
  const [images, setImages] = useState([]); // multiple images
  const [zip, setZip] = useState(null);

  const imgRef = useRef(null);
  const zipRef = useRef(null);

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();

  const {
    mutate: createPost,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async ({ text, img, zip }) => {
      try {
        const res = await fetch("/api/posts/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text, img, zip }), // img is now an array
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },

    onSuccess: () => {
      setText("");
      setImages([]);
      setZip(null);
      toast.success("Post created successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createPost({ text, img: images, zip });
  };

  // Handle multiple image selection
  const handleImgChange = (e) => {
    const files = Array.from(e.target.files);
    const readers = files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers)
      .then((base64s) => setImages((prev) => [...prev, ...base64s]))
      .catch((err) => console.error("Image read error:", err));
  };

  const handleZipChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setZip(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className='flex p-4 items-start gap-4 border-b border-gray-700'>
      <div className='avatar'>
        <div className='w-8 rounded-full'>
          <img src={authUser?.profileImg || "/avatar-placeholder.png"} />
        </div>
      </div>

      <form className='flex flex-col gap-2 w-full' onSubmit={handleSubmit}>
        <textarea
          className='textarea w-full p-0 text-lg resize-none border-none focus:outline-none  border-gray-800'
          placeholder='What is happening?!'
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* PREVIEW MULTIPLE IMAGES */}
        {images.length > 0 && (
          <div className='flex gap-2 overflow-x-auto py-2'>
            {images.map((img, idx) => (
              <div key={idx} className='relative w-32 h-32 flex-shrink-0'>
                <img src={img} alt={`upload-${idx}`} className='w-full h-full object-cover rounded border' />
                <IoCloseSharp
                  className='absolute top-1 right-1 text-white bg-black/70 rounded-full w-5 h-5 cursor-pointer'
                  onClick={() => removeImage(idx)}
                />
              </div>
            ))}
          </div>
        )}

        {/* SHOW ZIP FILE IF SELECTED */}
        {zip && (
          <div className='relative w-72 mx-auto border border-gray-500 rounded p-2 flex items-center justify-between'>
            <span className='text-sm'>ZIP file attached</span>
            <IoCloseSharp
              className='text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer'
              onClick={() => {
                setZip(null);
                zipRef.current.value = null;
              }}
            />
          </div>
        )}

        {/* ACTIONS */}
        <div className='flex justify-between border-t py-2 border-t-gray-700'>
          <div className='flex gap-2 items-center'>
            <CiImageOn
              className='fill-primary w-6 h-6 cursor-pointer'
              onClick={() => imgRef.current.click()}
            />
            <BsEmojiSmileFill className='fill-primary w-5 h-5 cursor-pointer' />
            <button
              type='button'
              className='text-sm underline'
              onClick={() => zipRef.current.click()}
            >
              Add ZIP
            </button>
          </div>

          {/* HIDDEN FILE INPUTS */}
          <input
            type='file'
            accept='image/*'
            multiple
            hidden
            ref={imgRef}
            onChange={handleImgChange}
          />
          <input
            type='file'
            accept='.zip'
            hidden
            ref={zipRef}
            onChange={handleZipChange}
          />

          <button className='btn btn-primary rounded-full btn-sm text-white px-4'>
            {isPending ? "Posting..." : "Post"}
          </button>
        </div>
        {isError && <div className='text-red-500'>{error.message}</div>}
      </form>
    </div>
  );
};

export default CreatePost;
