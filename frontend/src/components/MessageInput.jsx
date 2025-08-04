import React, { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreveiw, setImagePreveiw] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreveiw(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreveiw(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!text.trim() && !imagePreveiw) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreveiw,
      });

      // Clear form
      setText("");
      setImagePreveiw(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Failed to send message: ", error);
    }
  };

  return (
    <div className="p-4 w-full">
      {imagePreveiw && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreveiw}
              alt="Preview"
              className="w-21 h-21 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              type="button"
              className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-base-300 "
            >
              <X />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden "
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <button
            type="button"
            className={`hidden sm:flex btn btn-circle ${
              imagePreveiw ? "text-emerald-500 " : "text-zinc-400"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          className="btn btn-sm btn-circle"
          type="submit"
          disabled={!text.trim() && !imagePreveiw}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
