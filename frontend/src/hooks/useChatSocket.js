// src/hooks/useChatSocket.js
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "../lib/socket";
import { useMarkMessagesAsRead } from "./useChat";

export const useChatSocket = (selectedUserId) => {
  const queryClient = useQueryClient();
  const { mutate: markMessagesAsRead } = useMarkMessagesAsRead();
  const authUser = queryClient.getQueryData(["authUser"]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !selectedUserId._id) return;

    if (!selectedUserId.isRead) {
      queryClient.invalidateQueries({ queryKey: ["unreadMessagesCount"] });
    }

    queryClient.setQueryData(["users"], (old) => {
      if (!old) return [];

      const index = old.findIndex(
        (user) =>
          user.lastMessageSenderId === selectedUserId._id &&
          user.lastMessageReceiverId === authUser._id
      );
      if (index === -1) return old;

      const updated = [...old];

      updated[index] = { ...updated[index], isRead: true };
      return updated;
    });

    const handleNewMessage = (newMessage) => {
      if (newMessage.senderId === selectedUserId._id) {
        queryClient.setQueryData(["messages", selectedUserId._id], (old) => [
          ...(old || []),
          newMessage,
        ]);
      }

      // Nếu tin nhắn từ selectedUser và đang mở ChatContainer, đánh dấu là đã xem
      if (
        newMessage.senderId === selectedUserId._id &&
        newMessage.receiverId === authUser._id
      ) {
        markMessagesAsRead(newMessage.senderId);
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messagesRead", (data) => {
      const { userId, messageId } = data;
      if (userId === selectedUserId._id) {
        queryClient.setQueryData(["messages", selectedUserId._id], (old) =>
          old.map((message) =>
            message.senderId === messageId && message.isRead === false
              ? { ...message, isRead: true }
              : message
          )
        );
      }
    });

    return () => {
      socket.off("newMessage");
      socket.off("messagesRead");
    };
  }, [selectedUserId._id, queryClient, markMessagesAsRead, authUser]);
};
