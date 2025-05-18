import { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useSendMessage } from "../../hooks/useChat";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { selectedUser } = useSelector((state) => state.chat);
  const { mutate: sendMessage, isPending } = useSendMessage();
  const queryClient = useQueryClient();

  // Handle loading draft and clearing form when selectedUser changes
  useEffect(() => {
    if (selectedUser?._id) {
      // Load draft for the selected user
      const drafts = JSON.parse(localStorage.getItem("messageDrafts") || "{}");
      setText(drafts[selectedUser._id] || "");
    } else {
      // Clear form if no user is selected
      setText("");
    }
    // Always clear image preview and file input when user changes
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [selectedUser]);

  // Save draft to localStorage when text changes (only on user input)
  const saveDraft = (newText) => {
    if (selectedUser?._id) {
      const drafts = JSON.parse(localStorage.getItem("messageDrafts") || "{}");
      if (newText.trim()) {
        drafts[selectedUser._id] = newText;
      } else {
        delete drafts[selectedUser._id];
      }
      localStorage.setItem("messageDrafts", JSON.stringify(drafts));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file?.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    if (!selectedUser) {
      toast.error("Please select a user to send message");
      return;
    }

    sendMessage(
      {
        userId: selectedUser._id,
        messageData: {
          text: text.trim(),
          image: imagePreview,
        },
      },
      {
        onSuccess: () => {
          queryClient.setQueryData(["users"], (old) => {
            if (!old) return [];

            const index = old.findIndex(
              (user) => user.lastMessageReceiverId === selectedUser._id
            );
            if (index === -1) return old;

            const updated = [...old];

            updated[index] = { ...updated[index], text: text.trim() };
            return updated;
          });

          setText("");
          setImagePreview(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
          const drafts = JSON.parse(
            localStorage.getItem("messageDrafts") || "{}"
          );
          delete drafts[selectedUser._id];
          localStorage.setItem("messageDrafts", JSON.stringify(drafts));
        },
      }
    );
  };

  const handleInputFocus = () => {
    if (selectedUser?._id) {
      // markMessagesAsRead(selectedUser._id);
    }
  };

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
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
            onFocus={handleInputFocus}
            onChange={(e) => {
              setText(e.target.value);
              saveDraft(e.target.value);
            }}
            disabled={isPending}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
            disabled={isPending}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={
            isPending || (!text.trim() && !imagePreview) || !selectedUser
          }
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
