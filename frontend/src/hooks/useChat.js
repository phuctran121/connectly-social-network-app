import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  getMessages,
  sendMessage,
  getLatestMessages,
  markMessagesAsRead,
  markMessagesAsReadWhileMessaging,
  getUnreadMessagesCount,
} from "../services/chatApi";
import toast from "react-hot-toast";

export const useGetUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });
};

export const useGetMessages = (userId) => {
  return useQuery({
    queryKey: ["messages", userId],
    queryFn: () => getMessages(userId),
    enabled: !!userId,
  });
};

export const useGetUnreadMessagesCount = () => {
  return useQuery({
    queryKey: ["unreadMessagesCount"],
    queryFn: getUnreadMessagesCount,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["messages", variables.userId], (old) => [
        ...(old || []),
        data,
      ]);
      queryClient.setQueryData(["users"], (oldUsers) => {
        if (!oldUsers) return oldUsers;

        const updatedUsers = [...oldUsers];

        const userIndex = updatedUsers.findIndex(
          (user) => user._id === variables.userId
        );

        if (userIndex !== -1) {
          const [user] = updatedUsers.splice(userIndex, 1);
          const updatedUser = {
            ...user,
            lastMessageSenderId: data.senderId,
            lastMessageReceiverId: data.receiverId,
            lastMessageTime: data.createdAt,
            isRead: true,
          };
          updatedUsers.unshift(updatedUser);
        }

        return updatedUsers;
      });
    },
    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });
};

export const useGetLatestMessages = () => {
  return useQuery({
    queryKey: ["latestMessages"],
    queryFn: getLatestMessages,
  });
};

export const useMarkMessagesAsRead = () => {
  // const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markMessagesAsRead,
    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });
};

export const useMarkMessagesAsReadWhileMessaging = () => {
  // const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markMessagesAsReadWhileMessaging,
    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });
};
