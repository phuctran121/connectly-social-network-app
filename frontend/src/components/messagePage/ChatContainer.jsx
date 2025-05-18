import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useGetMessages } from "../../hooks/useChat";
import { useChatSocket } from "../../hooks/useChatSocket";
import { useCheckAuth } from "../../hooks/useAuth";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../../lib/utils";

const ChatContainer = () => {
  const { selectedUser } = useSelector((state) => state.chat);
  const { data: authUser } = useCheckAuth();
  const { data: messages, isLoading } = useGetMessages(selectedUser?._id);
  const messageEndRef = useRef(null);
  // Tích hợp WebSocket
  useChatSocket(selectedUser);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isLoading || !selectedUser) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }
  const lastMessageId =
    messages?.length > 0 ? messages[messages.length - 1]._id : null;

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser?._id ? "chat-end" : "chat-start "
            }`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser?._id
                      ? authUser?.profilePic || "/avatar.png"
                      : selectedUser?.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
            {message.senderId === authUser?._id &&
              message._id === lastMessageId && (
                <div className="text-sm font-extralight text-gray-500">
                  {message.isRead ? "Đã xem" : "Đã gửi"}
                </div>
              )}
          </div>
        ))}
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
